"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PosService", {
    enumerable: true,
    get: function() {
        return PosService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _invoiceenums = require("../invoice/invoice.enums");
const _library = require("@prisma/client/runtime/library");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _codetemplateservice = require("../code-template/code-template.service");
const _codetemplateenums = require("../code-template/code-template.enums");
const _createpossaledto = require("./dto/create-pos-sale.dto");
const _invoiceservice = require("../invoice/invoice.service");
const _collectionservice = require("../collection/collection.service");
const _salesagentresponsedto = require("./dto/sales-agent-response.dto");
const _cashboxservice = require("../cashbox/cashbox.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let PosService = class PosService {
    /**
   * Create DRAFT invoice for POS cart
   */ async createDraftSale(dto, userId) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        if (!dto.accountId) {
            throw new _common.BadRequestException('POS satışı için müşteri (cari) seçimi zorunludur.');
        }
        // Frontend fields mapping
        const effectiveSalesAgentId = dto.salesAgentId || dto.salespersonId;
        const effectiveNotes = dto.notes || dto.note;
        return this.prisma.$transaction(async (tx)=>{
            // 1. Generate Invoice Number (Required for DB)
            const invoiceNo = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.INVOICE_SALES);
            // 2. Calculate totals
            let subtotal = 0;
            let totalVat = 0;
            let totalItemDiscount = 0;
            const invoiceItems = dto.items.map((item)=>{
                // Gelen birim fiyat KDV dahil (brüt) kabul edilir.
                // Veritabanı ve muhasebe için KDV hariç (net) tutara dönüştürülür.
                const inclusivePrice = item.unitPrice;
                const exclusivePrice = inclusivePrice / (1 + item.vatRate / 100);
                const itemTotal = item.quantity * exclusivePrice;
                // Item-level discount calculation
                let itemDiscount = 0;
                const discountType = item.discountType || _createpossaledto.DiscountType.PCT;
                // Use discountValue if present, otherwise fallback to discountRate as percentage
                if (item.discountValue !== undefined && item.discountValue !== null) {
                    if (discountType === _createpossaledto.DiscountType.PCT) {
                        itemDiscount = itemTotal * (item.discountValue / 100);
                    } else {
                        // FIXED amount discount
                        itemDiscount = Math.min(item.discountValue * item.quantity, itemTotal);
                    }
                } else if (item.discountRate && item.discountRate > 0) {
                    // Backward compatibility for discountRate
                    itemDiscount = itemTotal * (item.discountRate / 100);
                }
                const itemVat = (itemTotal - itemDiscount) * (item.vatRate / 100);
                const itemAmount = itemTotal - itemDiscount + itemVat;
                subtotal += itemTotal;
                totalVat += itemVat;
                totalItemDiscount += itemDiscount;
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: new _library.Decimal(exclusivePrice),
                    vatRate: item.vatRate,
                    vatAmount: new _library.Decimal(itemVat),
                    amount: new _library.Decimal(itemAmount),
                    discountRate: new _library.Decimal(item.discountRate || (discountType === _createpossaledto.DiscountType.PCT ? item.discountValue || 0 : 0)),
                    discountAmount: new _library.Decimal(itemDiscount),
                    discountType: discountType,
                    tenantId
                };
            });
            // 3. Calculate global discount
            let globalDiscount = 0;
            const gType = dto.globalDiscount?.type || dto.globalDiscountType || _createpossaledto.DiscountType.PCT;
            const gValue = dto.globalDiscount?.value ?? dto.globalDiscountValue ?? 0;
            const afterItemDisc = subtotal - totalItemDiscount;
            if (gValue > 0 && afterItemDisc > 0) {
                if (gType === _createpossaledto.DiscountType.PCT) {
                    globalDiscount = afterItemDisc * (gValue / 100);
                } else {
                    globalDiscount = Math.min(gValue, afterItemDisc);
                }
                // Proportionally reduce VAT for global discount
                const ratio = globalDiscount / afterItemDisc;
                totalVat = totalVat * (1 - ratio);
            }
            const totalDiscount = totalItemDiscount + globalDiscount;
            const grandTotal = subtotal - totalDiscount + totalVat;
            // 3.5 Resolve Warehouse (Required for Stock Movements)
            let finalWarehouseId = dto.warehouseId;
            if (!finalWarehouseId) {
                const defaultWarehouse = await tx.warehouse.findFirst({
                    where: {
                        ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                        isDefault: true,
                        active: true
                    }
                });
                finalWarehouseId = defaultWarehouse?.id || undefined;
            }
            // 4. Create invoice in DRAFT status with items
            const invoice = await tx.invoice.create({
                data: {
                    tenantId,
                    accountId: dto.accountId,
                    salesAgentId: effectiveSalesAgentId || null,
                    warehouseId: finalWarehouseId,
                    invoiceType: _invoiceenums.InvoiceType.SALE,
                    status: _invoiceenums.InvoiceStatus.DRAFT,
                    invoiceNo: invoiceNo,
                    totalAmount: new _library.Decimal(subtotal),
                    vatAmount: new _library.Decimal(totalVat),
                    discount: new _library.Decimal(totalDiscount),
                    globalDiscountType: gType,
                    globalDiscountValue: gValue ? new _library.Decimal(gValue) : null,
                    grandTotal: new _library.Decimal(grandTotal),
                    payableAmount: new _library.Decimal(grandTotal),
                    currency: 'TRY',
                    exchangeRate: new _library.Decimal(1),
                    createdBy: userId,
                    updatedBy: userId,
                    items: {
                        create: invoiceItems
                    }
                }
            });
            return invoice;
        });
    }
    /**
   * Complete sale transaction using central services
   */ async completeSale(invoiceId, payments, userId, cashboxId) {
        const tenantId = await this.tenantResolver.resolveForQuery({
            userId
        });
        return this.prisma.$transaction(async (tx)=>{
            const prisma = tx;
            // 1. Fetch the invoice
            const invoice = await prisma.invoice.findFirst({
                where: {
                    id: invoiceId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                include: {
                    items: true
                }
            });
            if (!invoice) {
                throw new _common.NotFoundException('Satış kaydı bulunamadı');
            }
            if (invoice.status !== _invoiceenums.InvoiceStatus.DRAFT && invoice.status !== _invoiceenums.InvoiceStatus.OPEN) {
                throw new _common.BadRequestException('Bu satış zaten tamamlanmış veya geçersiz durumda');
            }
            // 2. Status guard and Payment validation
            const grandTotal = Number(invoice.grandTotal);
            const totalPaid = payments.reduce((sum, p)=>sum + p.amount, 0);
            if (totalPaid > grandTotal + 0.01) {
                throw new _common.BadRequestException(`Ödeme tutarı (${totalPaid.toFixed(2)}) fatura toplamını (${grandTotal.toFixed(2)}) aşamaz.`);
            }
            // 3. Update Invoice to APPROVED (triggers stock EXIT + account DEBIT)
            await this.invoiceService.changeStatus(invoiceId, _invoiceenums.InvoiceStatus.APPROVED, userId, undefined, undefined, prisma);
            // 4. Process Payments (Collections via CollectionService)
            let totalCollected = 0;
            for (const payment of payments){
                if (payment.paymentMethod === _client.PaymentMethod.LOAN_ACCOUNT) {
                    totalCollected += payment.amount;
                    continue;
                }
                let resolvedCashboxId = payment.cashboxId || cashboxId || null;
                let resolvedBankAccountId = payment.bankAccountId || null;
                if (payment.paymentMethod === _client.PaymentMethod.CASH) {
                    let retailCashbox = await this.cashboxService.getRetailCashbox();
                    // Fallback: If no isRetail marked, look for code "PK"
                    if (!retailCashbox) {
                        retailCashbox = await prisma.cashbox.findFirst({
                            where: {
                                code: 'PK',
                                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined, true),
                                isActive: true
                            }
                        });
                    }
                    if (!retailCashbox) {
                        throw new _common.BadRequestException('Lütfen "PK" kodlu bir kasa veya "Perakende Satış Kasası" olarak işaretlenmiş bir kasa tanımlayınız.');
                    }
                    resolvedCashboxId = retailCashbox.id;
                }
                if (payment.paymentMethod === _client.PaymentMethod.CREDIT_CARD || payment.paymentMethod === _client.PaymentMethod.BANK_TRANSFER) {
                    if (!resolvedBankAccountId) {
                        throw new _common.BadRequestException('Banka hesabi secimi zorunludur.');
                    }
                    const bankAccount = await prisma.bankAccount.findFirst({
                        where: {
                            id: resolvedBankAccountId,
                            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined, true)
                        },
                        select: {
                            id: true,
                            type: true,
                            isActive: true
                        }
                    });
                    if (!bankAccount || !bankAccount.isActive) {
                        throw new _common.BadRequestException('Gecerli ve aktif bir banka hesabi seciniz.');
                    }
                    if (payment.paymentMethod === _client.PaymentMethod.CREDIT_CARD && bankAccount.type !== _client.BankAccountType.POS) {
                        throw new _common.BadRequestException('Kredi karti odemesi icin POS Hesabi seciniz.');
                    }
                    if (payment.paymentMethod === _client.PaymentMethod.BANK_TRANSFER && bankAccount.type !== _client.BankAccountType.DEMAND_DEPOSIT) {
                        throw new _common.BadRequestException('Banka havalesi icin Vadesiz Hesap seciniz.');
                    }
                }
                await this.collectionService.create({
                    accountId: invoice.accountId,
                    invoiceId: invoice.id,
                    type: _client.CollectionType.COLLECTION,
                    amount: payment.amount,
                    date: new Date().toISOString(),
                    paymentMethod: payment.paymentMethod,
                    cashboxId: resolvedCashboxId,
                    bankAccountId: resolvedBankAccountId,
                    companyCreditCardId: payment.companyCreditCardId || null,
                    installmentCount: payment.installmentCount ?? null,
                    notes: `POS Satış Tahsilatı: ${invoice.invoiceNo}`
                }, userId, prisma);
                totalCollected += payment.amount;
            }
            // 5. Determine final status
            let finalStatus;
            if (Math.abs(totalCollected - grandTotal) < 0.01) {
                finalStatus = _invoiceenums.InvoiceStatus.CLOSED;
            } else if (totalCollected > 0) {
                finalStatus = _invoiceenums.InvoiceStatus.PARTIALLY_PAID;
            } else {
                finalStatus = _invoiceenums.InvoiceStatus.APPROVED;
            }
            // Update invoice: final status + paidAmount
            await prisma.invoice.update({
                where: {
                    id: invoiceId
                },
                data: {
                    status: finalStatus,
                    paidAmount: new _library.Decimal(totalCollected),
                    updatedBy: userId
                }
            });
            // 6. Final Audit Log
            await prisma.invoiceLog.create({
                data: {
                    tenantId: tenantId,
                    invoiceId: invoiceId,
                    userId,
                    actionType: 'STATUS_CHANGE',
                    changes: JSON.stringify({
                        oldStatus: invoice.status,
                        newStatus: finalStatus
                    })
                }
            });
            return {
                invoiceId,
                invoiceNumber: invoice.invoiceNo,
                grandTotal: grandTotal.toString(),
                paidAmount: totalCollected.toString(),
                status: finalStatus
            };
        });
    }
    /**
   * Create return transaction with ACID guarantees
   */ async createReturn(dto, userId) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        const originalInvoice = await this.prisma.invoice.findFirst({
            where: {
                id: dto.originalInvoiceId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            },
            include: {
                items: true,
                account: true
            }
        });
        if (!originalInvoice) {
            throw new _common.NotFoundException('Orijinal fatura bulunamadı');
        }
        return this.prisma.$transaction(async (tx)=>{
            // Generate invoice number
            const invoiceNumber = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.INVOICE_SALES);
            // Create return invoice
            const returnInvoice = await tx.invoice.create({
                data: {
                    tenantId,
                    accountId: originalInvoice.accountId,
                    invoiceType: _invoiceenums.InvoiceType.SALES_RETURN,
                    status: _invoiceenums.InvoiceStatus.DRAFT,
                    invoiceNo: invoiceNumber,
                    totalAmount: new _library.Decimal(dto.totalAmount),
                    vatAmount: new _library.Decimal(0),
                    discount: new _library.Decimal(0),
                    grandTotal: new _library.Decimal(dto.totalAmount),
                    payableAmount: new _library.Decimal(dto.totalAmount),
                    paidAmount: new _library.Decimal(0),
                    currency: 'TRY',
                    exchangeRate: new _library.Decimal(1),
                    notes: (dto.notes || '') + ' [İade orijinal fatura: ' + dto.originalInvoiceId + ']',
                    createdBy: userId,
                    updatedBy: userId,
                    items: {
                        create: dto.items.map((item)=>({
                                productId: item.productId,
                                quantity: item.quantity,
                                unitPrice: new _library.Decimal(item.unitPrice),
                                vatRate: item.vatRate,
                                vatAmount: new _library.Decimal(0),
                                amount: new _library.Decimal(item.quantity * item.unitPrice),
                                discountRate: new _library.Decimal(0),
                                discountAmount: new _library.Decimal(0),
                                tenantId
                            }))
                    }
                }
            });
            // Approve return (processes stock and balance back)
            await this.invoiceService.changeStatus(returnInvoice.id, _invoiceenums.InvoiceStatus.APPROVED, userId, undefined, undefined, tx);
            // Create refund payment if not LOAN_ACCOUNT
            if (dto.paymentMethod !== _client.PaymentMethod.LOAN_ACCOUNT) {
                await this.collectionService.create({
                    accountId: originalInvoice.accountId,
                    invoiceId: returnInvoice.id,
                    type: _client.CollectionType.PAYMENT,
                    amount: dto.totalAmount,
                    date: new Date().toISOString(),
                    paymentMethod: dto.paymentMethod,
                    notes: `İade Ödemesi: ${invoiceNumber}`
                }, userId, tx);
            }
            return {
                id: returnInvoice.id,
                invoiceNo: returnInvoice.invoiceNo,
                status: 'SUCCESS'
            };
        });
    }
    /**
   * Create POS cashier session
   */ async createSession(dto, userId) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        // Generate session number
        const sessionNo = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.POS_CONSOLE);
        return this.prisma.posSession.create({
            data: {
                tenantId,
                cashierId: dto.cashierId,
                cashboxId: dto.cashboxId,
                openingAmount: new _library.Decimal(dto.openingAmount),
                status: 'OPEN',
                sessionNo,
                createdBy: userId,
                updatedBy: userId
            }
        });
    }
    /**
   * Close POS cashier session
   */ async closeSession(sessionId, dto, userId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const session = await this.prisma.posSession.findFirst({
            where: {
                id: sessionId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!session) {
            throw new _common.NotFoundException('Oturum bulunamadı');
        }
        if (session.status !== 'OPEN') {
            throw new _common.BadRequestException('Sadece açık oturumlar kapatılabilir');
        }
        return this.prisma.posSession.updateMany({
            where: {
                id: sessionId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            data: {
                closingAmount: new _library.Decimal(dto.closingAmount),
                closingNotes: dto.closingNotes,
                status: 'CLOSED',
                closedAt: new Date(),
                updatedBy: userId
            }
        });
    }
    /**
   * Searches for products by barcode or product code.
   * Returns all fields needed for the POS cart (price, VAT, stock, variants).
   */ /**
   * Searches for products by barcode or product code.
   * Returns all fields needed for the POS cart (price, VAT, stock, variants).
   */ async getProductsByBarcode(barcode, tenantId) {
        const resolvedTenantId = tenantId ?? await this.tenantResolver.resolveForQuery();
        const products = await this.prisma.product.findMany({
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(resolvedTenantId ?? undefined),
                deletedAt: null,
                OR: [
                    {
                        barcode: {
                            equals: barcode,
                            mode: 'insensitive'
                        }
                    },
                    {
                        code: {
                            equals: barcode,
                            mode: 'insensitive'
                        }
                    },
                    {
                        productBarcodes: {
                            some: {
                                barcode: {
                                    equals: barcode,
                                    mode: 'insensitive'
                                }
                            }
                        }
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                barcode: true,
                code: true,
                vatRate: true,
                priceCards: {
                    where: {
                        type: 'SALE',
                        isActive: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                },
                productLocationStocks: {
                    where: {
                        ...(0, _stagingutil.buildTenantWhereClause)(resolvedTenantId ?? undefined)
                    },
                    select: {
                        qtyOnHand: true
                    }
                }
            }
        });
        return products.map((p)=>{
            const salePrice = p.priceCards?.length > 0 ? p.priceCards[0].price.toString() : '0';
            const totalStock = p.productLocationStocks?.reduce((sum, s)=>sum + (s.qtyOnHand || 0), 0) || 0;
            return {
                id: p.id,
                name: p.name,
                barcode: p.barcode,
                code: p.code,
                salePrice,
                vatRate: p.vatRate ?? 20,
                stock: totalStock,
                hasVariants: false,
                productVariants: []
            };
        });
    }
    /**
   * Returns active sales agents for the current tenant.
   * Used by the POS frontend SelectorBox for salesperson selection.
   */ async getSalesAgents(search) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const agents = await this.prisma.salesAgent.findMany({
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                isActive: true,
                ...search && search.trim().length > 0 ? {
                    fullName: {
                        contains: search.trim(),
                        mode: 'insensitive'
                    }
                } : {}
            },
            select: {
                id: true,
                fullName: true,
                phone: true,
                email: true,
                isActive: true
            },
            orderBy: {
                fullName: 'asc'
            },
            take: 20
        });
        return agents.map(_salesagentresponsedto.SalesAgentResponseDto.fromPrisma);
    }
    /**
   * Get active carts (DRAFT/OPEN invoices) for a cashier
   */ async getActiveCarts(cashierId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.invoice.findMany({
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                invoiceType: _invoiceenums.InvoiceType.SALE,
                status: {
                    in: [
                        _invoiceenums.InvoiceStatus.DRAFT,
                        _invoiceenums.InvoiceStatus.OPEN
                    ]
                },
                deletedAt: null,
                createdBy: cashierId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                account: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    /**
   * Delete draft cart
   */ async deleteDraftCart(invoiceId, userId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                id: invoiceId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            }
        });
        if (!invoice) {
            throw new _common.NotFoundException('Fatura bulunamadı');
        }
        if (invoice.status !== _invoiceenums.InvoiceStatus.DRAFT && invoice.status !== _invoiceenums.InvoiceStatus.OPEN) {
            throw new _common.BadRequestException('Sadece taslak faturalar silinebilir');
        }
        return this.prisma.invoice.updateMany({
            where: {
                id: invoiceId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            data: {
                deletedAt: new Date(),
                deletedBy: userId
            }
        });
    }
    async getRetailCashbox() {
        return this.cashboxService.getRetailCashbox();
    }
    async getBankAccountsByType(type) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const whereClause = {
            type,
            isActive: true
        };
        // Some legacy accounts may have null tenantId on bank_accounts.
        // In that case, fall back to the parent bank's tenant ownership.
        if (tenantId) {
            whereClause.OR = [
                {
                    tenantId
                },
                {
                    tenantId: null,
                    bank: {
                        tenantId
                    }
                }
            ];
        }
        return this.prisma.bankAccount.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                accountNo: true,
                iban: true,
                type: true,
                bank: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [
                {
                    bank: {
                        name: 'asc'
                    }
                },
                {
                    name: 'asc'
                }
            ]
        });
    }
    constructor(prisma, tenantResolver, codeTemplateService, invoiceService, collectionService, cashboxService){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.codeTemplateService = codeTemplateService;
        this.invoiceService = invoiceService;
        this.collectionService = collectionService;
        this.cashboxService = cashboxService;
    }
};
PosService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(2, (0, _common.Inject)((0, _common.forwardRef)(()=>_codetemplateservice.CodeTemplateService))),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService,
        typeof _invoiceservice.InvoiceService === "undefined" ? Object : _invoiceservice.InvoiceService,
        typeof _collectionservice.CollectionService === "undefined" ? Object : _collectionservice.CollectionService,
        typeof _cashboxservice.CashboxService === "undefined" ? Object : _cashboxservice.CashboxService
    ])
], PosService);

//# sourceMappingURL=pos.service.js.map