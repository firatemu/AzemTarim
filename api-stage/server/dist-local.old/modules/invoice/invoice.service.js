// CHANGED: createInvoice (PURCHASE branch), cancelInvoice (PURCHASE branch)
// REASON: purchase workflow status automation v2
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoiceService", {
    enumerable: true,
    get: function() {
        return InvoiceService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _invoiceenums = require("./invoice.enums");
const _saleswaybillenums = require("../sales-waybill/sales-waybill.enums");
const _library = require("@prisma/client/runtime/library");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _codetemplateenums = require("../code-template/code-template.enums");
const _codetemplateservice = require("../code-template/code-template.service");
const _saleswaybillservice = require("../sales-waybill/sales-waybill.service");
const _invoiceprofitservice = require("../invoice-profit/invoice-profit.service");
const _costingservice = require("../costing/costing.service");
const _systemparameterservice = require("../system-parameter/system-parameter.service");
const _warehouseservice = require("../warehouse/warehouse.service");
const _accountbalanceservice = require("../account-balance/account-balance.service");
const _deletionprotectionservice = require("../../common/services/deletion-protection.service");
const _tcmbservice = require("../../common/services/tcmb.service");
const _invoiceorchestratorservice = require("./services/invoice-orchestrator.service");
const _stockeffectservice = require("./services/stock-effect.service");
const _accounteffectservice = require("./services/account-effect.service");
const _unitsetservice = require("../unit-set/unit-set.service");
const _statuscalculatorservice = require("../shared/status-calculator/status-calculator.service");
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
let InvoiceService = class InvoiceService {
    /** Prisma Decimal veya number'ı güvenle number'a çevirir (null/undefined → 0). */ toDecimalNumber(val) {
        if (val == null) return 0;
        if (typeof val === 'number' && !Number.isNaN(val)) return val;
        if (typeof val === 'object' && val !== null && 'toNumber' in val && typeof val.toNumber === 'function') return val.toNumber();
        return Number(val) || 0;
    }
    async createLog(invoiceId, actionType, userId, changes, ipAddress, userAgent, tx) {
        const prisma = tx || this.prisma;
        const tenantId = await this.tenantResolver.resolveForQuery();
        await prisma.invoiceLog.create({
            data: {
                invoiceId: invoiceId,
                userId,
                actionType: actionType,
                changes: changes ? JSON.stringify(changes) : null,
                ipAddress,
                userAgent,
                tenantId: tenantId
            }
        });
    }
    /**
   * Update warehouse stock (ProductLocationStock) and create StockMove record
   */ async updateWarehouseStock(warehouseId, productId, quantity, moveType, refId, refType, note, userId, prisma) {
        // Check WMS Module status
        const tenantId = await this.tenantResolver.resolveForQuery();
        const wmsParam = await prisma.systemParameter.findFirst({
            where: {
                key: 'ENABLE_WMS_MODULE',
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            orderBy: {
                tenantId: 'desc'
            }
        });
        const isWmsEnabled = wmsParam?.value === 'true' || wmsParam?.value === true;
        if (!isWmsEnabled) {
            // WMS disabled: Do NOT track shelf location or create StockMove.
            // Basic Inventory (ProductMovement) is already handled in the calling method.
            return;
        }
        // Get or create default location for the warehouse
        const defaultLocation = await this.warehouseService.getOrCreateDefaultLocation(warehouseId);
        // Find existing ProductLocationStock
        let stock = await prisma.productLocationStock.findFirst({
            where: {
                warehouseId,
                locationId: defaultLocation.id,
                productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        const qtyChange = moveType === 'PUT_AWAY' ? quantity : -quantity;
        if (stock) {
            const newQty = stock.qtyOnHand + qtyChange;
            // Check if negative stock control is enabled
            const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_STOCK_CONTROL', false);
            // Prevent negative stock only if the parameter is enabled
            if (negativeStockControlEnabled) {
                // Calculate total warehouse stock across all locations
                const warehouseStockResult = await prisma.productLocationStock.aggregate({
                    where: {
                        warehouseId,
                        productId,
                        ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                    },
                    _sum: {
                        qtyOnHand: true
                    }
                });
                const totalWarehouseQty = warehouseStockResult._sum.qtyOnHand || 0;
                if (totalWarehouseQty + qtyChange < 0) {
                    throw new _common.BadRequestException(`Insufficient stock in warehouse. Available: ${totalWarehouseQty}, Requested: ${quantity}`);
                }
            }
            await prisma.productLocationStock.updateMany({
                where: {
                    warehouseId,
                    locationId: defaultLocation.id,
                    productId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                data: {
                    qtyOnHand: newQty,
                    updatedAt: new Date()
                }
            });
        } else {
            // Create new stock record
            if (moveType === 'SALE') {
                // Check if negative stock control is enabled
                const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_STOCK_CONTROL', false);
                if (negativeStockControlEnabled) {
                    // Calculate total warehouse stock across all locations
                    const warehouseStockResult = await prisma.productLocationStock.aggregate({
                        where: {
                            warehouseId,
                            productId,
                            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                        },
                        _sum: {
                            qtyOnHand: true
                        }
                    });
                    const totalWarehouseQty = warehouseStockResult._sum.qtyOnHand || 0;
                    if (totalWarehouseQty - quantity < 0) {
                        throw new _common.BadRequestException(`Insufficient stock in warehouse. Available: ${totalWarehouseQty}, Requested: ${quantity}`);
                    }
                }
                // If negative stock is allowed, create a negative stock record
                const createTenantId = await this.tenantResolver.resolveForCreate({
                    userId
                });
                await prisma.productLocationStock.create({
                    data: {
                        warehouseId,
                        locationId: defaultLocation.id,
                        productId,
                        quantity: -quantity,
                        tenantId: createTenantId
                    }
                });
            } else {
                // For PUT_AWAY, create positive stock
                const createTenantId = await this.tenantResolver.resolveForCreate({
                    userId
                });
                await prisma.productLocationStock.create({
                    data: {
                        warehouseId,
                        locationId: defaultLocation.id,
                        productId,
                        quantity: quantity,
                        tenantId: createTenantId
                    }
                });
            }
        }
        // Create StockMove record
        const createTenantId = await this.tenantResolver.resolveForCreate({
            userId
        });
        await prisma.stockMove.create({
            data: {
                productId,
                fromWarehouseId: moveType === 'SALE' ? warehouseId : null,
                fromLocationId: moveType === 'SALE' ? defaultLocation.id : null,
                toWarehouseId: warehouseId,
                toLocationId: defaultLocation.id,
                quantity,
                moveType: moveType,
                refType,
                refId,
                notes: note,
                createdBy: userId,
                tenantId: createTenantId
            }
        });
    }
    /**
   * Run costing service for PURCHASE invoice
   * Calculates cost for productIds inside invoice items
   */ async calculateCostsForInvoiceItems(items, invoiceId, invoiceNo) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean('AUTO_COSTING_ON_PURCHASE_INVOICE', true);
        if (!autoCostingEnabled) return;
        const productIds = items.map((i)=>i.productId).filter((id)=>id !== null && id !== undefined);
        if (productIds.length === 0) return;
        const uniqueProductIds = [
            ...new Set(productIds)
        ];
        const costingPromises = uniqueProductIds.map(async (productId)=>{
            try {
                await this.costingService.calculateWeightedAverageCost(productId);
            } catch (error) {
                console.error(`[InvoiceService] Product ${productId} costing error:`, {
                    productId,
                    invoiceId,
                    invoiceNo,
                    error: error?.message || error
                });
            }
        });
        await Promise.allSettled(costingPromises);
    }
    async findAll(page = 1, limit = 50, type, search, accountId, sortBy, sortOrder) {
        try {
            const skip = (page - 1) * limit;
            const tenantId = await this.tenantResolver.resolveForQuery();
            const where = {
                deletedAt: null,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            };
            if (type) {
                where.invoiceType = type;
            }
            if (accountId) {
                where.accountId = accountId;
            }
            if (search) {
                where.OR = [
                    {
                        invoiceNo: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        account: {
                            title: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    },
                    {
                        account: {
                            code: {
                                contains: search,
                                mode: 'insensitive'
                            }
                        }
                    }
                ];
            }
            const [data, total] = await Promise.all([
                this.prisma.invoice.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        account: {
                            select: {
                                id: true,
                                code: true,
                                title: true,
                                type: true
                            }
                        },
                        deliveryNote: {
                            select: {
                                id: true,
                                deliveryNoteNo: true,
                                sourceOrder: {
                                    select: {
                                        id: true,
                                        orderNo: true
                                    }
                                }
                            }
                        },
                        invoiceCollections: {
                            include: {
                                collection: {
                                    select: {
                                        id: true,
                                        date: true,
                                        type: true,
                                        paymentType: true
                                    }
                                }
                            },
                            orderBy: {
                                createdAt: 'desc'
                            }
                        },
                        createdByUser: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true
                            }
                        },
                        updatedByUser: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true
                            }
                        },
                        _count: {
                            select: {
                                items: true
                            }
                        }
                    },
                    orderBy: sortBy ? {
                        [sortBy]: sortOrder || 'desc'
                    } : {
                        createdAt: 'desc'
                    }
                }),
                this.prisma.invoice.count({
                    where
                })
            ]);
            const dataWithKalan = data.map((item)=>{
                return {
                    ...item,
                    remainingAmount: Number(item.grandTotal) - Number(item.paidAmount || 0)
                };
            });
            return {
                data: dataWithKalan,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Invoice findAll error:', error);
            throw new _common.BadRequestException(`Error occurred while loading invoices: ${error.message}`);
        }
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                account: true,
                deliveryNote: {
                    select: {
                        id: true,
                        deliveryNoteNo: true,
                        warehouseId: true,
                        sourceOrder: {
                            select: {
                                id: true,
                                orderNo: true
                            }
                        }
                    }
                },
                purchaseDeliveryNote: {
                    select: {
                        id: true,
                        deliveryNoteNo: true,
                        warehouseId: true
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                },
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                },
                updatedByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                },
                deletedByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                },
                paymentPlans: true,
                logs: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
        if (!invoice) {
            throw new _common.NotFoundException(`Invoice not found: ${id}`);
        }
        // Warehouse: from invoice or fallback to delivery note
        const fallbackWarehouseId = invoice.deliveryNote?.warehouseId ?? invoice.purchaseDeliveryNote?.warehouseId ?? null;
        const warehouseId = invoice.warehouseId ?? (fallbackWarehouseId ? String(fallbackWarehouseId) : undefined);
        return {
            ...invoice,
            warehouseId,
            items: (invoice.items || []).map((item)=>({
                    ...item,
                    vatRate: item.vatRate ?? 0,
                    product: item.product ? {
                        ...item.product,
                        stokKodu: item.product.code,
                        stokAdi: item.product.name
                    } : null
                }))
        };
    }
    async create(createFaturaDto, userId, ipAddress, userAgent) {
        const { items, orderId, deliveryNoteId, warehouseId, salesAgentId, eScenario, eInvoiceType, gibAlias, shippingType, status: inputStatus, ...rawInvoiceData } = createFaturaDto;
        const invoiceData = {
            ...rawInvoiceData
        };
        const tenantId = await this.tenantResolver.resolveForQuery();
        const autoApprove = await this.systemParameterService.getParameterAsBoolean('AUTO_APPROVE_INVOICE', false);
        // AUTO_APPROVE_INVOICE parametresi aktifse APPROVED, değilse gönderilen status ya da DRAFT
        let status = autoApprove ? _invoiceenums.InvoiceStatus.APPROVED : inputStatus || _invoiceenums.InvoiceStatus.DRAFT;
        if (!invoiceData.invoiceNo || invoiceData.invoiceNo.trim() === '') {
            try {
                if (invoiceData.type === _invoiceenums.InvoiceType.SALE) {
                    invoiceData.invoiceNo = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.INVOICE_SALES);
                } else if (invoiceData.type === _invoiceenums.InvoiceType.PURCHASE) {
                    invoiceData.invoiceNo = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.INVOICE_PURCHASE);
                } else {
                    throw new _common.BadRequestException(`Fatura tipi desteklenmiyor: ${invoiceData.type}`);
                }
            } catch (error) {
                throw new _common.BadRequestException(`Fatura numarası üretilirken hata: ${error.message}. Lütfen Şablon Ayarlarını kontrol edin.`);
            }
        }
        const existingInvoice = await this.prisma.invoice.findFirst({
            where: {
                invoiceNo: invoiceData.invoiceNo,
                ...tenantId && {
                    tenantId
                }
            }
        });
        if (existingInvoice) {
            throw new _common.BadRequestException(`Bu fatura numarası zaten mevcut: ${invoiceData.invoiceNo}`);
        }
        let cascadeDeliveryNoteId = null;
        let cascadePurchaseDeliveryNoteId = null;
        let sourceDeliveryNote = null;
        const account = await this.prisma.account.findFirst({
            where: {
                id: invoiceData.accountId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            select: {
                id: true,
                salesAgentId: true,
                title: true,
                balance: true,
                creditLimit: true,
                blockOnRisk: true,
                efaturaPostaKutusu: true
            }
        });
        if (!account) {
            throw new _common.NotFoundException(`Account not found: ${invoiceData.accountId}`);
        }
        // Eğer frontend'den gibAlias gelmezse, cari hesaptan al
        const finalGibAlias = gibAlias || account.efaturaPostaKutusu || null;
        // Satış faturası için fatura türü her zaman SATIS olmalı
        const finalEInvoiceType = invoiceData.type === _invoiceenums.InvoiceType.SALE ? 'SATIS' : eInvoiceType || null;
        // Validate quantities for unit divisibility
        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: items.map((i)=>i.productId)
                }
            },
            select: {
                id: true,
                unitId: true
            }
        });
        for (const item of items){
            const product = products.find((p)=>p.id === item.productId);
            if (product?.unitId) {
                await this.unitSetService.validateQuantity(product.unitId, item.quantity);
            }
        }
        let totalAmount = 0;
        let vatAmount = 0;
        let sctTotal = 0;
        let withholdingTotal = 0;
        const itemsWithCalculations = items.map((item)=>{
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.unitPrice) || 0;
            const rawAmount = quantity * unitPrice;
            const discountRate = item.discountRate !== undefined ? Number(item.discountRate) : 0;
            let discountAmount = 0;
            if (item.discountAmount !== undefined && item.discountAmount !== null && Number(item.discountAmount) > 0) {
                discountAmount = Number(item.discountAmount);
            } else {
                discountAmount = rawAmount * discountRate / 100;
            }
            const amount = rawAmount - discountAmount;
            const sctRate = Number(item.sctRate) || 0;
            const sctAmount = amount * sctRate / 100;
            const vatBasis = amount + sctAmount;
            const rawVat = item.vatRate;
            const vatRateInt = rawVat === 0 || typeof rawVat === 'string' && rawVat === '0' ? 0 : Math.round(Number(rawVat) || 0);
            const itemVat = vatBasis * vatRateInt / 100;
            const withholdingRate = Number(item.withholdingRate) || 0;
            const itemWithholding = itemVat * withholdingRate;
            totalAmount += amount;
            vatAmount += itemVat;
            sctTotal += sctAmount;
            withholdingTotal += itemWithholding;
            return {
                productId: String(item.productId),
                quantity,
                unitPrice,
                vatRate: vatRateInt,
                discountRate: new _library.Decimal(discountRate),
                discountAmount: new _library.Decimal(discountAmount),
                amount: new _library.Decimal(amount),
                vatAmount: new _library.Decimal(itemVat),
                withholdingCode: item.withholdingCode || null,
                withholdingRate: new _library.Decimal(withholdingRate),
                sctRate: new _library.Decimal(sctRate),
                sctAmount: new _library.Decimal(sctAmount),
                vatExemptionReason: item.vatExemptionReason || null,
                unit: item.unit || null,
                tenantId: tenantId
            };
        });
        const generalDiscount = invoiceData.discount !== undefined ? Number(invoiceData.discount) : 0;
        totalAmount -= generalDiscount;
        const grandTotal = totalAmount + vatAmount + sctTotal - withholdingTotal;
        // Risk Limit Kontrolü - Sadece satış faturaları için
        if (invoiceData.type === _invoiceenums.InvoiceType.SALE && account.blockOnRisk && account.creditLimit !== null && account.creditLimit !== undefined) {
            const currentBalance = Number(account.balance) || 0;
            const creditLimit = Number(account.creditLimit) || 0;
            const newBalance = currentBalance + grandTotal;
            if (newBalance > creditLimit) {
                const excessAmount = newBalance - creditLimit;
                throw new _common.BadRequestException({
                    error: 'RISK_LIMIT_EXCEEDED',
                    message: `Cari hesap risk limiti aşılıyor. ${account.title} hesabı için risk limiti: ₺${creditLimit.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2
                    })}, Mevcut bakiye: ₺${currentBalance.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2
                    })}, Yeni fatura tutarı: ₺${grandTotal.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2
                    })}`,
                    details: {
                        accountId: account.id,
                        accountTitle: account.title,
                        creditLimit: creditLimit,
                        currentBalance: currentBalance,
                        invoiceAmount: grandTotal,
                        newBalance: newBalance,
                        excessAmount: excessAmount
                    }
                });
            }
        }
        let currency = createFaturaDto.currency || 'TRY';
        let exchangeRate = createFaturaDto.exchangeRate;
        let foreignTotal = null;
        if (currency && currency !== 'TRY') {
            if (!exchangeRate) {
                try {
                    exchangeRate = await this.tcmbService.getCurrentRate(currency);
                } catch (error) {
                    console.error(`Kur alınamadı: ${error}`);
                }
            }
            if (exchangeRate && exchangeRate > 0) {
                foreignTotal = new _library.Decimal(grandTotal).div(exchangeRate).toNumber();
            }
        }
        let salesOrder = null;
        let orderPickings = [];
        if (orderId) {
            salesOrder = await this.prisma.salesOrder.findFirst({
                where: {
                    id: orderId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                include: {
                    orderPickings: {
                        include: {
                            orderItem: {
                                include: {
                                    product: true
                                }
                            },
                            location: true
                        }
                    },
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            if (!salesOrder) {
                throw new _common.NotFoundException(`Order not found: ${orderId}`);
            }
            if (salesOrder.status === 'INVOICED') {
                throw new _common.BadRequestException('Sipariş zaten faturalandırılmış');
            }
            orderPickings = salesOrder.orderPickings;
        }
        if (invoiceData.type === _invoiceenums.InvoiceType.SALE && status === _invoiceenums.InvoiceStatus.APPROVED && warehouseId) {
            const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_STOCK_CONTROL', false);
            if (negativeStockControlEnabled) {
                const stockIssues = [];
                for (const item of itemsWithCalculations){
                    const product = await this.prisma.product.findFirst({
                        where: {
                            id: item.productId,
                            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                        },
                        select: {
                            code: true,
                            name: true
                        }
                    });
                    const stock = await this.prisma.productLocationStock.aggregate({
                        where: {
                            warehouseId,
                            productId: item.productId,
                            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                        },
                        _sum: {
                            qtyOnHand: true
                        }
                    });
                    const currentStock = stock._sum.qtyOnHand || 0;
                    const requestedQty = item.quantity;
                    if (currentStock < requestedQty) {
                        stockIssues.push({
                            productCode: product?.code || 'Bilinmiyor',
                            productName: product?.name || 'Bilinmiyor',
                            currentStock: Number(currentStock),
                            request: requestedQty
                        });
                    }
                }
                if (stockIssues.length > 0) {
                    const errorDetails = stockIssues.map((issue)=>`• ${issue.productCode} - ${issue.productName}: Available stock ${issue.currentStock}, requested ${issue.request}`).join('\n');
                    throw new _common.BadRequestException(`Insufficient stock! There is not enough stock for the following products:\n\n${errorDetails}`);
                }
            }
        }
        if (invoiceData.type === _invoiceenums.InvoiceType.SALE) {
            const riskControlEnabled = await this.systemParameterService.getParameterAsBoolean('CARI_RISK_CONTROL', false);
            if (riskControlEnabled) {
                const creditLimit = account?.creditLimit ? Number(account.creditLimit) : 0;
                if (creditLimit > 0) {
                    const currentBalance = account?.balance ? Number(account.balance) : 0;
                    const nextBalance = currentBalance + grandTotal;
                    if (nextBalance > creditLimit) {
                        const currentDebt = Math.max(currentBalance, 0);
                        const remainingCapacity = creditLimit - currentDebt;
                        throw new _common.BadRequestException(`Risk limit exceeded! The defined risk limit for "${account?.title}" is ${creditLimit.toLocaleString('tr-TR')} TRY. ` + `Current debt ${currentDebt.toLocaleString('tr-TR')} TRY, remaining capacity ${Math.max(0, remainingCapacity).toLocaleString('tr-TR')} TRY. ` + `This invoice (${grandTotal.toLocaleString('tr-TR')} TRY) exceeds the limit.`);
                    }
                }
            }
        }
        const result = await this.prisma.$transaction(async (prisma)=>{
            let transactionWarehouseId = warehouseId;
            let transactionDeliveryNoteId = undefined;
            let transPurchaseDeliveryNoteId = undefined;
            if (deliveryNoteId) {
                if (invoiceData.type === _invoiceenums.InvoiceType.SALE || invoiceData.type === _invoiceenums.InvoiceType.SALES_RETURN) {
                    sourceDeliveryNote = await prisma.salesDeliveryNote.findFirst({
                        where: {
                            id: deliveryNoteId,
                            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                        },
                        include: {
                            sourceOrder: {
                                select: {
                                    id: true,
                                    orderNo: true
                                }
                            },
                            items: true
                        }
                    });
                    if (!sourceDeliveryNote) {
                        throw new _common.NotFoundException(`Sales waybill not found: ${deliveryNoteId}`);
                    }
                    if (sourceDeliveryNote.status === _saleswaybillenums.DeliveryNoteStatus.INVOICED) {
                        throw new _common.BadRequestException('Bu deliveryNote zaten tamamen faturalandırılmış');
                    }
                    for (const faturaKalemi of items){
                        // Find ALL delivery note items for this product (there can be multiple)
                        const dnItems = sourceDeliveryNote.items.filter((ik)=>ik.productId === faturaKalemi.productId);
                        if (dnItems.length === 0) {
                            continue;
                        }
                        let remainingToInvoice = Number(faturaKalemi.quantity);
                        let totalAvailable = 0;
                        // Calculate total available quantity across all matching delivery note items
                        for (const dnItem of dnItems){
                            const currentInvoiced = Number(dnItem.invoicedQuantity || 0);
                            const available = Number(dnItem.quantity) - currentInvoiced;
                            totalAvailable += available;
                        }
                        if (remainingToInvoice > totalAvailable) {
                            throw new _common.BadRequestException(`Ürün (ID: ${faturaKalemi.productId}) için faturalanan miktar (${remainingToInvoice}), sevk edilen kalan miktarı (${totalAvailable}) aşamaz.`);
                        }
                        // Distribute the invoice quantity across all matching delivery note items
                        for (const dnItem of dnItems){
                            if (remainingToInvoice <= 0) break;
                            const currentInvoiced = Number(dnItem.invoicedQuantity || 0);
                            const available = Number(dnItem.quantity) - currentInvoiced;
                            const toInvoice = Math.min(remainingToInvoice, available);
                            if (toInvoice > 0) {
                                await prisma.salesDeliveryNoteItem.updateMany({
                                    where: {
                                        id: dnItem.id,
                                        ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                                    },
                                    data: {
                                        invoicedQuantity: {
                                            increment: toInvoice
                                        }
                                    }
                                });
                                remainingToInvoice -= toInvoice;
                            }
                        }
                    }
                    // Add invoice number to delivery note's invoiceNos array
                    await prisma.salesDeliveryNote.update({
                        where: {
                            id: deliveryNoteId
                        },
                        data: {
                            invoiceNos: {
                                push: invoiceData.invoiceNo
                            }
                        }
                    });
                    // Update source order's invoiceNo if the delivery note has a source order
                    if (sourceDeliveryNote.sourceOrder) {
                        await prisma.salesOrder.updateMany({
                            where: {
                                id: sourceDeliveryNote.sourceOrder.id,
                                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                            },
                            data: {
                                invoiceNo: invoiceData.invoiceNo,
                                status: 'INVOICED'
                            }
                        });
                    }
                    const updatedDN = await prisma.salesDeliveryNote.findFirst({
                        where: {
                            id: deliveryNoteId,
                            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                        },
                        include: {
                            items: true
                        }
                    });
                    const isFullyInvoiced = updatedDN?.items.every((k)=>Number(k.invoicedQuantity || 0) >= Number(k.quantity));
                    if (isFullyInvoiced) {
                        await prisma.salesDeliveryNote.updateMany({
                            where: {
                                id: deliveryNoteId,
                                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                            },
                            data: {
                                status: _saleswaybillenums.DeliveryNoteStatus.INVOICED
                            }
                        });
                    }
                    transactionDeliveryNoteId = deliveryNoteId;
                    if (sourceDeliveryNote.warehouseId) transactionWarehouseId = sourceDeliveryNote.warehouseId;
                } else if (invoiceData.type === _invoiceenums.InvoiceType.PURCHASE || invoiceData.type === _invoiceenums.InvoiceType.PURCHASE_RETURN) {
                    const pDeliveryNote = await prisma.purchaseDeliveryNote.findFirst({
                        where: {
                            id: deliveryNoteId,
                            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                        },
                        include: {
                            sourceOrder: {
                                select: {
                                    id: true,
                                    orderNo: true
                                }
                            }
                        }
                    });
                    if (!pDeliveryNote) {
                        throw new _common.NotFoundException(`Purchase delivery note not found: ${deliveryNoteId}`);
                    }
                    if (pDeliveryNote.status === _saleswaybillenums.DeliveryNoteStatus.INVOICED) {
                        throw new _common.BadRequestException('Bu deliveryNote zaten faturalandırılmış');
                    }
                    await prisma.purchaseDeliveryNote.updateMany({
                        where: {
                            id: deliveryNoteId,
                            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                        },
                        data: {
                            status: _saleswaybillenums.DeliveryNoteStatus.INVOICED
                        }
                    });
                    // Update source order's invoiceNo if the delivery note has a source order
                    if (pDeliveryNote.sourceOrder) {
                        await prisma.procurementOrder.updateMany({
                            where: {
                                id: pDeliveryNote.sourceOrder.id,
                                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                            },
                            data: {
                                invoiceNo: invoiceData.invoiceNo,
                                status: 'INVOICED'
                            }
                        });
                    }
                    transPurchaseDeliveryNoteId = deliveryNoteId;
                    if (pDeliveryNote.warehouseId) transactionWarehouseId = pDeliveryNote.warehouseId;
                }
            } else if (invoiceData.type === _invoiceenums.InvoiceType.SALE && !invoiceData.preventAutoDeliveryNote) {
                let dnNo;
                try {
                    dnNo = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.DELIVERY_NOTE_SALES);
                } catch (error) {
                    const year = new Date().getFullYear();
                    const lastDN = await prisma.salesDeliveryNote.findFirst({
                        where: {
                            ...tenantId && {
                                tenantId
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    });
                    const lastNoStr = lastDN?.deliveryNoteNo || '';
                    const lastNo = lastNoStr ? parseInt(lastNoStr.split('-').pop() || '0') : 0;
                    dnNo = `IRS-${year}-${(lastNo + 1).toString().padStart(6, '0')}`;
                }
                const dnTotalAmount = totalAmount + (invoiceData.discount || 0);
                const dnItems = itemsWithCalculations.map((k)=>({
                        productId: k.productId,
                        quantity: k.quantity,
                        unitPrice: new _library.Decimal(k.unitPrice),
                        vatRate: k.vatRate,
                        vatAmount: new _library.Decimal(k.vatAmount),
                        totalAmount: new _library.Decimal(k.amount)
                    }));
                const dn = await prisma.salesDeliveryNote.create({
                    data: {
                        deliveryNoteNo: dnNo,
                        date: new Date(invoiceData.date),
                        tenantId,
                        accountId: invoiceData.accountId,
                        warehouseId: warehouseId || null,
                        sourceType: _saleswaybillenums.DeliveryNoteSourceType.INVOICE_AUTOMATIC,
                        sourceId: null,
                        status: _saleswaybillenums.DeliveryNoteStatus.INVOICED,
                        subtotal: new _library.Decimal(dnTotalAmount),
                        vatAmount: new _library.Decimal(vatAmount),
                        grandTotal: new _library.Decimal(grandTotal),
                        discount: new _library.Decimal(invoiceData.discount || 0),
                        notes: invoiceData.notes || null,
                        createdBy: userId,
                        items: {
                            create: dnItems
                        }
                    }
                });
                transactionDeliveryNoteId = dn.id;
            } else if (invoiceData.type === _invoiceenums.InvoiceType.PURCHASE && !invoiceData.preventAutoDeliveryNote) {
                let dnNo;
                try {
                    dnNo = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.DELIVERY_NOTE_PURCHASE);
                } catch (error) {
                    const year = new Date().getFullYear();
                    const lastDN = await prisma.purchaseDeliveryNote.findFirst({
                        where: {
                            ...tenantId && {
                                tenantId
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    });
                    const lastNoStr = lastDN?.deliveryNoteNo || '';
                    const lastNo = lastNoStr ? parseInt(lastNoStr.split('-').pop() || '0') : 0;
                    dnNo = `AIRS-${year}-${(lastNo + 1).toString().padStart(6, '0')}`;
                }
                const dnTotalAmount = totalAmount + (invoiceData.discount || 0);
                const dnItems = itemsWithCalculations.map((k)=>({
                        productId: k.productId,
                        quantity: k.quantity,
                        unitPrice: new _library.Decimal(k.unitPrice),
                        vatRate: k.vatRate,
                        vatAmount: new _library.Decimal(k.vatAmount),
                        totalAmount: new _library.Decimal(k.amount)
                    }));
                const dn = await prisma.purchaseDeliveryNote.create({
                    data: {
                        deliveryNoteNo: dnNo,
                        date: new Date(invoiceData.date),
                        tenantId,
                        accountId: invoiceData.accountId,
                        warehouseId: warehouseId || null,
                        sourceType: _saleswaybillenums.DeliveryNoteSourceType.INVOICE_AUTOMATIC,
                        sourceId: null,
                        status: _saleswaybillenums.DeliveryNoteStatus.INVOICED,
                        subtotal: new _library.Decimal(dnTotalAmount),
                        vatAmount: new _library.Decimal(vatAmount),
                        grandTotal: new _library.Decimal(grandTotal),
                        discount: new _library.Decimal(invoiceData.discount || 0),
                        notes: invoiceData.notes || null,
                        createdBy: userId,
                        items: {
                            create: dnItems
                        }
                    }
                });
                transPurchaseDeliveryNoteId = dn.id;
            }
            const createdInvoice = await prisma.invoice.create({
                data: {
                    invoiceNo: invoiceData.invoiceNo,
                    invoiceType: invoiceData.type,
                    accountId: invoiceData.accountId,
                    date: new Date(invoiceData.date),
                    dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null,
                    currency: currency || 'TRY',
                    exchangeRate: exchangeRate ? new _library.Decimal(exchangeRate) : new _library.Decimal(1),
                    foreignTotal: foreignTotal ? new _library.Decimal(foreignTotal) : null,
                    ...tenantId && {
                        tenantId
                    },
                    orderNo: salesOrder?.orderNo || sourceDeliveryNote?.orderNo || null,
                    // TODO: deliveryNoteNo field needs to be added to database schema
                    // deliveryNoteNo: ((sourceDeliveryNote as any)?.deliveryNoteNo || null) as any,
                    deliveryNoteId: transactionDeliveryNoteId || null,
                    purchaseDeliveryNoteId: transPurchaseDeliveryNoteId || null,
                    warehouseId: transactionWarehouseId || null,
                    totalAmount: new _library.Decimal(totalAmount),
                    vatAmount: new _library.Decimal(vatAmount),
                    sctTotal: new _library.Decimal(sctTotal),
                    withholdingTotal: new _library.Decimal(withholdingTotal),
                    grandTotal: new _library.Decimal(grandTotal),
                    discount: new _library.Decimal(invoiceData.discount ?? 0),
                    paidAmount: new _library.Decimal(0),
                    payableAmount: new _library.Decimal(grandTotal),
                    status: status,
                    notes: invoiceData.notes || null,
                    createdBy: userId,
                    salesAgentId: salesAgentId || null,
                    eScenario: eScenario || null,
                    eInvoiceType: finalEInvoiceType,
                    gibAlias: finalGibAlias,
                    deliveryMethod: shippingType || null,
                    items: {
                        create: itemsWithCalculations.map((k)=>({
                                productId: k.productId,
                                quantity: k.quantity,
                                unitPrice: new _library.Decimal(k.unitPrice),
                                vatRate: k.vatRate,
                                vatAmount: k.vatAmount,
                                amount: k.amount,
                                discountRate: k.discountRate,
                                discountAmount: k.discountAmount,
                                withholdingCode: k.withholdingCode || null,
                                withholdingRate: k.withholdingRate,
                                sctRate: k.sctRate,
                                sctAmount: k.sctAmount,
                                vatExemptionReason: k.vatExemptionReason || null,
                                unit: k.unit || null,
                                tenantId: tenantId
                            }))
                    }
                },
                include: {
                    account: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            if (salesOrder && salesOrder.id) {
                await prisma.salesOrder.updateMany({
                    where: {
                        id: salesOrder.id,
                        ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                    },
                    data: {
                        status: 'INVOICED',
                        invoiceNo: invoiceData.invoiceNo
                    }
                });
            }
            if (status === _invoiceenums.InvoiceStatus.APPROVED) {
                await this.processInvoiceMovements(createdInvoice, prisma, userId, transactionWarehouseId, orderPickings, tenantId);
            }
            await this.createLog(createdInvoice.id, 'CREATE', userId, {
                invoice: invoiceData,
                items: itemsWithCalculations
            }, ipAddress, userAgent, prisma);
            return {
                createdInvoice,
                cascadeDeliveryNoteId: transactionDeliveryNoteId || null,
                cascadePurchaseDeliveryNoteId: transPurchaseDeliveryNoteId || null
            };
        });
        const { createdInvoice, cascadeDeliveryNoteId: cDNId, cascadePurchaseDeliveryNoteId: cPDNId } = result;
        try {
            if (invoiceData.type === _invoiceenums.InvoiceType.SALE || invoiceData.type === _invoiceenums.InvoiceType.PURCHASE) {
                const moduleType = invoiceData.type === _invoiceenums.InvoiceType.SALE ? _codetemplateenums.ModuleType.INVOICE_SALES : _codetemplateenums.ModuleType.INVOICE_PURCHASE;
                await this.codeTemplateService.saveLastCode(moduleType, createdInvoice.invoiceNo);
            }
        } catch (error) {
            console.error(`❌ [InvoiceService] Son numara kaydedilemedi: ${createdInvoice.invoiceNo}`, error);
        }
        if (invoiceData.type === _invoiceenums.InvoiceType.PURCHASE) {
            try {
                const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean('AUTO_COSTING_ON_PURCHASE_INVOICE', true);
                if (autoCostingEnabled) {
                    await this.calculateCostsForInvoiceItems(createdInvoice.items, createdInvoice.id, createdInvoice.invoiceNo);
                }
            } catch (error) {
                console.error(`[InvoiceService] Invoice ${createdInvoice.id} (${createdInvoice.invoiceNo}) costing error:`, {
                    error: error?.message || error
                });
            }
        }
        if (cDNId && tenantId) {
            await this.statusCalculator.recalculateCascade(cDNId, String(tenantId)).catch((err)=>console.error('[InvoiceService] Recalculate cascade failed:', err?.message));
        }
        if (cPDNId && tenantId) {
            await this.statusCalculator.recalculatePurchaseCascade(cPDNId, String(tenantId)).catch((err)=>console.error('[InvoiceService] Recalculate purchase cascade failed:', err?.message));
        }
        return createdInvoice;
    }
    async update(id, updateInvoiceDto, userId, ipAddress, userAgent) {
        const invoice = await this.findOne(id);
        // Yalnızca DRAFT veya PENDING durumundaki faturalar düzenlenebilir
        const EDITABLE_STATUSES = [
            _invoiceenums.InvoiceStatus.DRAFT,
            _invoiceenums.InvoiceStatus.PENDING
        ];
        if (!EDITABLE_STATUSES.includes(invoice.status)) {
            throw new _common.BadRequestException(`Bu fatura düzenlenemez. Mevcut durum: ${invoice.status}. Yalnızca TASLAK (DRAFT) veya BEKLEMEDEki (PENDING) faturalar düzenlenebilir.`);
        }
        // If items are not updated, only update invoice info
        if (!updateInvoiceDto.items) {
            const { accountId, invoiceNo, type, items, warehouseId, orderId, deliveryNoteId, salesAgentId, ...updateData } = updateInvoiceDto;
            // Check invoiceNo uniqueness if changed
            if (invoiceNo !== undefined && invoiceNo.trim() !== '' && invoiceNo !== invoice.invoiceNo) {
                const tenantId = invoice.tenantId ?? undefined;
                const existing = await this.prisma.invoice.findFirst({
                    where: {
                        invoiceNo: invoiceNo.trim(),
                        ...tenantId && {
                            tenantId
                        },
                        id: {
                            not: id
                        }
                    }
                });
                if (existing) {
                    throw new _common.BadRequestException(`Invoice number already exists: ${invoiceNo}`);
                }
            }
            // Eğer DTO'dan gibAlias gelmezse, cari hesaptan al
            let finalGibAlias = updateData.gibAlias;
            if (!finalGibAlias) {
                const account = await this.prisma.account.findFirst({
                    where: {
                        id: invoice.accountId,
                        ...(0, _stagingutil.buildTenantWhereClause)(invoice.tenantId ?? undefined)
                    },
                    select: {
                        efaturaPostaKutusu: true
                    }
                });
                finalGibAlias = account?.efaturaPostaKutusu || null;
            }
            const tenantId = invoice.tenantId ?? undefined;
            const updated = await this.prisma.invoice.update({
                where: {
                    id
                },
                data: {
                    ...updateData,
                    invoiceType: type,
                    gibAlias: finalGibAlias,
                    updatedBy: userId,
                    salesAgentId,
                    ...updateInvoiceDto.warehouseId !== undefined && {
                        warehouseId: updateInvoiceDto.warehouseId || null
                    },
                    ...invoiceNo !== undefined && invoiceNo.trim() !== '' && {
                        invoiceNo: invoiceNo.trim()
                    },
                    ...updateInvoiceDto.shippingType !== undefined && {
                        deliveryMethod: updateInvoiceDto.shippingType || null
                    }
                },
                include: {
                    account: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            // Audit log
            await this.createLog(id, 'UPDATE', userId, updateData, ipAddress, userAgent);
            // Status change and process movements
            if (updateInvoiceDto.status === _invoiceenums.InvoiceStatus.APPROVED && invoice.status !== _invoiceenums.InvoiceStatus.APPROVED) {
                const whId = updateInvoiceDto.warehouseId ?? updated.warehouseId ?? invoice.warehouseId ?? undefined;
                await this.prisma.$transaction(async (tx)=>{
                    await this.processInvoiceMovements(updated, tx, userId, whId, [], updated.tenantId ?? invoice.tenantId);
                });
            }
            // Costing
            if (updated.invoiceType === _invoiceenums.InvoiceType.PURCHASE) {
                try {
                    const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean('AUTO_COSTING_ON_PURCHASE_INVOICE', true);
                    if (autoCostingEnabled) {
                        await this.calculateCostsForInvoiceItems(updated.items, updated.id, updated.invoiceNo);
                    }
                } catch (error) {
                    console.error(`Costing error (update): ${error.message}`);
                }
            }
            return updated;
        }
        // items update
        const { items, warehouseId, orderId, deliveryNoteId, type, ...invoiceData } = updateInvoiceDto;
        const newInvoiceNo = invoiceData.invoiceNo != null && String(invoiceData.invoiceNo).trim() !== '' ? String(invoiceData.invoiceNo).trim() : null;
        if (newInvoiceNo && newInvoiceNo !== invoice.invoiceNo) {
            const tenantId = invoice.tenantId ?? undefined;
            const existing = await this.prisma.invoice.findFirst({
                where: {
                    invoiceNo: newInvoiceNo,
                    ...tenantId && {
                        tenantId
                    },
                    id: {
                        not: id
                    }
                }
            });
            if (existing) {
                throw new _common.BadRequestException(`Invoice number already exists: ${newInvoiceNo}`);
            }
        }
        // Validate quantities for unit divisibility
        if (items && items.length > 0) {
            const products = await this.prisma.product.findMany({
                where: {
                    id: {
                        in: items.map((i)=>i.productId)
                    }
                },
                select: {
                    id: true,
                    unitId: true
                }
            });
            for (const item of items){
                const product = products.find((p)=>p.id === item.productId);
                if (product?.unitId) {
                    await this.unitSetService.validateQuantity(product.unitId, item.quantity);
                }
            }
        }
        let totalAmount = 0;
        let vatAmount = 0;
        let sctTotal = 0;
        let withholdingTotal = 0;
        const itemsWithCalculations = items.map((item)=>{
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.unitPrice) || 0;
            const rawAmount = quantity * unitPrice;
            const discountRate = item.discountRate !== undefined ? Number(item.discountRate) : 0;
            let discountAmount = 0;
            if (item.discountAmount !== undefined && item.discountAmount !== null && Number(item.discountAmount) > 0) {
                discountAmount = Number(item.discountAmount);
            } else {
                discountAmount = rawAmount * discountRate / 100;
            }
            const amount = rawAmount - discountAmount;
            const sctRate = Number(item.sctRate) || 0;
            const sctAmount = amount * sctRate / 100;
            const vatBasis = amount + sctAmount;
            const vatRateInt = Math.round(Number(item.vatRate) || 0);
            const itemVat = vatBasis * vatRateInt / 100;
            const withholdingRate = Number(item.withholdingRate) || 0;
            const itemWithholding = itemVat * withholdingRate;
            totalAmount += amount;
            vatAmount += itemVat;
            sctTotal += sctAmount;
            withholdingTotal += itemWithholding;
            return {
                productId: String(item.productId),
                quantity,
                unitPrice: new _library.Decimal(unitPrice),
                vatRate: vatRateInt,
                discountRate: new _library.Decimal(discountRate),
                discountAmount: new _library.Decimal(discountAmount),
                amount: new _library.Decimal(amount),
                vatAmount: new _library.Decimal(itemVat),
                withholdingCode: item.withholdingCode || null,
                withholdingRate: new _library.Decimal(withholdingRate),
                sctRate: new _library.Decimal(sctRate),
                sctAmount: new _library.Decimal(sctAmount),
                vatExemptionReason: item.vatExemptionReason || null,
                unit: item.unit || null,
                tenantId: invoice.tenantId
            };
        });
        const generalDiscount = updateInvoiceDto.discount !== undefined ? Number(updateInvoiceDto.discount) : invoice.discount?.toNumber() || 0;
        totalAmount -= generalDiscount;
        const grandTotal = totalAmount + vatAmount + sctTotal - withholdingTotal;
        // Eski fatura tutarını hesapla (güncelleme durumunda bakiye farkını bulmak için)
        const oldGrandTotal = invoice.grandTotal?.toNumber() || 0;
        const balanceChange = grandTotal - oldGrandTotal;
        // Risk Limit Kontrolü - Sadece satış faturaları için
        const invoiceType = type || invoice.invoiceType;
        if (invoiceType === _invoiceenums.InvoiceType.SALE) {
            // Account bilgilerini al (risk kontrolü için)
            const account = await this.prisma.account.findFirst({
                where: {
                    id: invoice.accountId,
                    ...(0, _stagingutil.buildTenantWhereClause)(invoice.tenantId ?? undefined)
                },
                select: {
                    id: true,
                    title: true,
                    balance: true,
                    creditLimit: true,
                    blockOnRisk: true,
                    efaturaPostaKutusu: true
                }
            });
            if (account?.blockOnRisk && account.creditLimit !== null && account.creditLimit !== undefined) {
                const currentBalance = Number(account.balance) || 0;
                const creditLimit = Number(account.creditLimit) || 0;
                // Yeni bakiye = mevcut bakiye + fatura tutarındaki değişim
                const newBalance = currentBalance + balanceChange;
                if (newBalance > creditLimit) {
                    const excessAmount = newBalance - creditLimit;
                    throw new _common.BadRequestException({
                        error: 'RISK_LIMIT_EXCEEDED',
                        message: `Cari hesap risk limiti aşılıyor. ${account.title} hesabı için risk limiti: ₺${creditLimit.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2
                        })}, Mevcut bakiye: ₺${currentBalance.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2
                        })}, Bakiye değişimi: ₺${balanceChange.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2
                        })}`,
                        details: {
                            accountId: account.id,
                            accountTitle: account.title,
                            creditLimit: creditLimit,
                            currentBalance: currentBalance,
                            balanceChange: balanceChange,
                            newBalance: newBalance,
                            excessAmount: excessAmount
                        }
                    });
                }
            }
        }
        // Eğer DTO'dan gibAlias gelmezse, cari hesaptan al
        let finalGibAlias = invoiceData.gibAlias;
        if (!finalGibAlias) {
            const account = await this.prisma.account.findFirst({
                where: {
                    id: invoice.accountId,
                    ...(0, _stagingutil.buildTenantWhereClause)(invoice.tenantId ?? undefined)
                },
                select: {
                    efaturaPostaKutusu: true
                }
            });
            finalGibAlias = account?.efaturaPostaKutusu || null;
        }
        // Currency calculation (Update)
        let { currency, exchangeRate } = updateInvoiceDto;
        if (!currency && invoice.currency) currency = invoice.currency;
        let foreignTotal = null;
        if (currency && currency !== 'TRY') {
            if (!exchangeRate) {
                if (currency === invoice.currency && invoice.exchangeRate) {
                    exchangeRate = invoice.exchangeRate.toNumber();
                } else {
                    try {
                        exchangeRate = await this.tcmbService.getCurrentRate(currency);
                    } catch (error) {
                        console.error(`Rate fetch failed: ${error}`);
                    }
                }
            }
            if (exchangeRate && exchangeRate > 0) {
                foreignTotal = new _library.Decimal(grandTotal).div(exchangeRate).toNumber();
            }
        }
        const updated = await this.prisma.$transaction(async (prisma)=>{
            if (invoice.status === _invoiceenums.InvoiceStatus.APPROVED) {
                await this.reverseInvoiceMovements(invoice, prisma, invoice.tenantId ?? undefined);
            }
            // Delete old items
            await prisma.invoiceItem.deleteMany({
                where: {
                    invoiceId: id
                }
            });
            // Update invoice and add new items
            const updatedRecord = await prisma.invoice.update({
                where: {
                    id
                },
                data: {
                    invoiceNo: invoiceData.invoiceNo !== undefined && invoiceData.invoiceNo.trim() !== '' ? invoiceData.invoiceNo.trim() : undefined,
                    invoiceType: type,
                    date: invoiceData.date ? new Date(invoiceData.date) : undefined,
                    dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : updateInvoiceDto.dueDate === null ? null : undefined,
                    gibAlias: finalGibAlias,
                    status: invoice.invoiceType === _invoiceenums.InvoiceType.SALE ? _invoiceenums.InvoiceStatus.APPROVED : updateInvoiceDto.status || invoice.status,
                    currency: currency || 'TRY',
                    exchangeRate: exchangeRate ? new _library.Decimal(exchangeRate) : new _library.Decimal(1),
                    foreignTotal: foreignTotal ? new _library.Decimal(foreignTotal) : null,
                    totalAmount: new _library.Decimal(totalAmount),
                    vatAmount: new _library.Decimal(vatAmount),
                    sctTotal: new _library.Decimal(sctTotal),
                    withholdingTotal: new _library.Decimal(withholdingTotal),
                    grandTotal: new _library.Decimal(grandTotal),
                    discount: new _library.Decimal(generalDiscount),
                    notes: invoiceData.notes || null,
                    updatedBy: userId,
                    eScenario: invoiceData.eScenario || null,
                    eInvoiceType: invoiceData.eInvoiceType || null,
                    deliveryMethod: invoiceData.shippingType || null,
                    ...warehouseId !== undefined && {
                        warehouseId: warehouseId || null
                    },
                    items: {
                        create: itemsWithCalculations
                    }
                },
                include: {
                    account: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            // Audit log (inside transaction)
            await this.createLog(id, 'UPDATE', userId, {
                ...invoiceData,
                items: itemsWithCalculations
            }, ipAddress, userAgent, prisma);
            if (updatedRecord.invoiceType === _invoiceenums.InvoiceType.SALE) {
                try {
                    await this.invoiceProfitService.calculateAndSaveProfit(updatedRecord.id, userId, prisma);
                } catch (error) {
                    console.error(`Profit calculation error (update): ${error.message}`);
                }
            }
            const shouldProcessMovements = updateInvoiceDto.status === _invoiceenums.InvoiceStatus.APPROVED && invoice.status !== _invoiceenums.InvoiceStatus.APPROVED || invoice.status === _invoiceenums.InvoiceStatus.APPROVED;
            if (shouldProcessMovements) {
                await this.processInvoiceMovements(updatedRecord, prisma, userId, warehouseId ?? updatedRecord.warehouseId ?? undefined, [], updatedRecord.tenantId ?? invoice.tenantId);
            }
            return updatedRecord;
        }, {
            timeout: 30000
        });
        // Maliyetlendirme (sadece PURCHASE faturaları için ve parametre açıksa) - TRANSACTION DIŞINDA
        if (invoice.invoiceType === _invoiceenums.InvoiceType.PURCHASE) {
            const shouldCalculateCosts = invoice.status !== _invoiceenums.InvoiceStatus.APPROVED || updateInvoiceDto.items || updateInvoiceDto.status;
            if (shouldCalculateCosts) {
                try {
                    const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean('AUTO_COSTING_ON_PURCHASE_INVOICE', true);
                    if (autoCostingEnabled) {
                        await this.calculateCostsForInvoiceItems(updated.items, updated.id, updated.invoiceNo);
                    }
                } catch (error) {
                    console.error(`[InvoiceService] Invoice ${updated.id} (${updated.invoiceNo}) için maliyetlendirme güncelleme hatası:`, {
                        error: error?.message || error
                    });
                }
            }
        }
        return updated;
    }
    async remove(id, userId, ipAddress, userAgent) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new _common.BadRequestException('Tenant ID not found.');
        const invoice = await this.findOne(id);
        // Protection check
        await this.deletionProtection.checkFaturaDeletion(id, tenantId);
        // Soft delete with effects reversal
        const deletedInvoice = await this.prisma.$transaction(async (prisma)=>{
            // Revert movements using new orchestration logic if approved
            if (invoice.status === _invoiceenums.InvoiceStatus.APPROVED) {
                await this.stockEffectService.reverseStockEffects(id, tenantId, prisma);
                await this.accountEffectService.reverseAccountEffect(id, tenantId, prisma);
            }
            // Soft delete: set deletedAt and deletedBy
            const deleted = await prisma.invoice.update({
                where: {
                    id
                },
                data: {
                    deletedAt: new Date(),
                    deletedBy: userId,
                    status: _invoiceenums.InvoiceStatus.CANCELLED,
                    ...tenantId && {
                        tenantId
                    }
                }
            });
            // Audit log (inside transaction)
            await this.createLog(id, 'DELETE', userId, {
                invoice
            }, ipAddress, userAgent, prisma);
            return deleted;
        });
        // Costing (only for PURCHASE and if parameter enabled) - OUTSIDE TRANSACTION
        if (invoice.invoiceType === _invoiceenums.InvoiceType.PURCHASE) {
            try {
                const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean('AUTO_COSTING_ON_PURCHASE_INVOICE', true);
                if (autoCostingEnabled) {
                    await this.calculateCostsForInvoiceItems(invoice.items, invoice.id, invoice.invoiceNo);
                }
            } catch (error) {
                console.error(`[InvoiceService] Invoice ${invoice.id} (${invoice.invoiceNo}) delete costing error:`, {
                    error: error?.message || error
                });
            }
        }
        return deletedInvoice;
    }
    async findDeleted(page = 1, limit = 50, invoiceType, search) {
        const skip = (page - 1) * limit;
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            deletedAt: {
                not: null
            },
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (invoiceType) {
            where.invoiceType = invoiceType;
        }
        if (search) {
            where.OR = [
                {
                    invoiceNo: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    account: {
                        title: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    account: {
                        code: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                include: {
                    account: true,
                    deletedByUser: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true
                        }
                    },
                    _count: {
                        select: {
                            items: true
                        }
                    }
                },
                orderBy: {
                    deletedAt: 'desc'
                }
            }),
            this.prisma.invoice.count({
                where
            })
        ]);
        return {
            data: data.map((item)=>({
                    ...item,
                    remainingAmount: Number(item.grandTotal) - Number(item.paidAmount || 0)
                })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async restore(id, userId, ipAddress, userAgent) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                account: true,
                items: true
            }
        });
        if (!invoice) {
            throw new _common.NotFoundException(`Invoice not found: ${id}`);
        }
        if (!invoice.deletedAt) {
            throw new _common.BadRequestException('This invoice is not deleted, cannot be restored.');
        }
        return this.prisma.$transaction(async (prisma)=>{
            // Restore the invoice
            const restored = await prisma.invoice.update({
                where: {
                    id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                data: {
                    deletedAt: null,
                    deletedBy: null,
                    updatedBy: userId
                },
                include: {
                    account: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            // If status is APPROVED, recreate stock and account movements
            if (invoice.status === _invoiceenums.InvoiceStatus.APPROVED) {
                // Create account movement
                const accountBalance = this.toDecimalNumber(invoice.account?.balance);
                const gt = this.toDecimalNumber(invoice.grandTotal);
                await prisma.accountMovement.create({
                    data: {
                        accountId: invoice.accountId,
                        tenantId: invoice.tenantId,
                        type: invoice.invoiceType === _invoiceenums.InvoiceType.SALE ? 'DEBIT' : 'CREDIT',
                        amount: gt,
                        balance: invoice.invoiceType === _invoiceenums.InvoiceType.SALE ? accountBalance + gt : accountBalance - gt,
                        documentType: 'INVOICE',
                        documentNo: invoice.invoiceNo,
                        date: invoice.date,
                        notes: invoice.notes || ''
                    }
                });
                // Update account balance
                const tenantId = restored.tenantId ?? undefined;
                await prisma.account.updateMany({
                    where: {
                        id: invoice.accountId,
                        ...(0, _stagingutil.buildTenantWhereClause)(tenantId)
                    },
                    data: {
                        balance: invoice.invoiceType === _invoiceenums.InvoiceType.SALE ? {
                            increment: invoice.grandTotal
                        } : {
                            decrement: invoice.grandTotal
                        }
                    }
                });
                // Recreate stock movements
                for (const item of invoice.items){
                    await prisma.productMovement.create({
                        data: {
                            productId: item.productId,
                            movementType: invoice.invoiceType === _invoiceenums.InvoiceType.SALE ? 'SALE' : 'ENTRY',
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            notes: `${invoice.invoiceType === _invoiceenums.InvoiceType.SALE ? 'Sales' : 'Purchase'} Invoice: ${invoice.invoiceNo} (Restored)`,
                            invoiceItemId: item.id
                        }
                    });
                }
            }
            // Audit log (inside transaction)
            await this.createLog(id, 'RESTORE', userId, {
                invoice
            }, ipAddress, userAgent, prisma);
            return restored;
        });
    }
    async cancel(id, userId, ipAddress, userAgent, cancelDeliveryNote) {
        const invoice = await this.findOne(id);
        const tenantId = await this.tenantResolver.resolveForQuery();
        // 1. Check if already cancelled
        if (invoice.status === _invoiceenums.InvoiceStatus.CANCELLED) {
            throw new _common.BadRequestException('This invoice is already cancelled.');
        }
        // 2. Only APPROVED or OPEN invoices can be cancelled
        if (invoice.status !== _invoiceenums.InvoiceStatus.APPROVED && invoice.status !== _invoiceenums.InvoiceStatus.OPEN) {
            throw new _common.BadRequestException('Only APPROVED or OPEN invoices can be cancelled.');
        }
        // 3. Paid invoices cannot be cancelled
        const paidAmount = Number(invoice.paidAmount || 0);
        if (paidAmount > 0.01) {
            throw new _common.BadRequestException(`This invoice has a payment of ₺${paidAmount.toFixed(2)}. ` + 'Paid invoices cannot be cancelled. Cancel payments first.');
        }
        const cancelledInvoice = await this.prisma.$transaction(async (prisma)=>{
            // For SALE/PURCHASE cancel: Only revert account, no stock movement created (status is cancelled)
            // For SALES_RETURN/PURCHASE_RETURN: Revert both account and stock
            if (invoice.status === _invoiceenums.InvoiceStatus.APPROVED) {
                if (invoice.invoiceType === _invoiceenums.InvoiceType.SALE || invoice.invoiceType === _invoiceenums.InvoiceType.PURCHASE) {
                    await this.reverseAccountOnlyForInvoice(invoice, prisma);
                } else {
                    await this.reverseInvoiceMovements(invoice, prisma, invoice.tenantId ?? undefined, true);
                }
            }
            const updated = await prisma.invoice.update({
                where: {
                    id
                },
                data: {
                    status: _invoiceenums.InvoiceStatus.CANCELLED
                },
                include: {
                    account: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
            // Cancellation audit log (if was approved)
            if (invoice.status === _invoiceenums.InvoiceStatus.APPROVED) {
                const currentAccount = await prisma.account.findUnique({
                    where: {
                        id: invoice.accountId
                    },
                    select: {
                        balance: true
                    }
                });
                if (currentAccount) {
                    await prisma.accountMovement.create({
                        data: {
                            accountId: invoice.accountId,
                            tenantId: invoice.tenantId,
                            type: invoice.invoiceType === _invoiceenums.InvoiceType.SALE ? 'CREDIT' : 'DEBIT',
                            amount: this.toDecimalNumber(invoice.grandTotal),
                            balance: this.toDecimalNumber(currentAccount.balance),
                            documentType: 'CORRECTION',
                            documentNo: `${invoice.invoiceNo}-CANCEL`,
                            date: new Date(),
                            notes: invoice.notes ? `${invoice.notes} (İptal)` : 'Fatura İptali'
                        }
                    });
                }
            }
            // Reverse invoicedQuantity on SalesDeliveryNoteItems
            if (invoice.deliveryNoteId && invoice.invoiceType === _invoiceenums.InvoiceType.SALE) {
                // Fetch all delivery note items to properly distribute the decrement
                const dnItems = await prisma.salesDeliveryNoteItem.findMany({
                    where: {
                        deliveryNoteId: invoice.deliveryNoteId,
                        ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                    }
                });
                for (const item of invoice.items){
                    let remainingToDecrement = Number(item.quantity);
                    // Find all delivery note items for this product
                    const matchingDnItems = dnItems.filter((dn)=>dn.productId === item.productId);
                    // Distribute the decrement across all matching items
                    for (const dnItem of matchingDnItems){
                        if (remainingToDecrement <= 0) break;
                        const currentInvoiced = Number(dnItem.invoicedQuantity || 0);
                        const toDecrement = Math.min(remainingToDecrement, currentInvoiced);
                        if (toDecrement > 0) {
                            await prisma.salesDeliveryNoteItem.updateMany({
                                where: {
                                    id: dnItem.id,
                                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                                },
                                data: {
                                    invoicedQuantity: {
                                        decrement: toDecrement
                                    }
                                }
                            });
                            remainingToDecrement -= toDecrement;
                        }
                    }
                }
                // Remove from invoiceNos list
                const dn = await prisma.salesDeliveryNote.findUnique({
                    where: {
                        id: invoice.deliveryNoteId
                    },
                    select: {
                        invoiceNos: true,
                        sourceId: true
                    }
                });
                if (dn?.invoiceNos) {
                    await prisma.salesDeliveryNote.update({
                        where: {
                            id: invoice.deliveryNoteId
                        },
                        data: {
                            invoiceNos: {
                                set: dn.invoiceNos.filter((no)=>no !== invoice.invoiceNo)
                            }
                        }
                    });
                }
                // Update delivery note status based on remaining invoices
                const updatedDN = await prisma.salesDeliveryNote.findFirst({
                    where: {
                        id: invoice.deliveryNoteId
                    },
                    include: {
                        items: true
                    }
                });
                if (updatedDN) {
                    const hasInvoices = updatedDN.invoiceNos && updatedDN.invoiceNos.length > 0;
                    if (!hasInvoices) {
                        // No invoices left, check if any items were invoiced
                        const anyInvoiced = updatedDN.items.some((k)=>Number(k.invoicedQuantity || 0) > 0);
                        await prisma.salesDeliveryNote.updateMany({
                            where: {
                                id: invoice.deliveryNoteId
                            },
                            data: {
                                status: anyInvoiced ? 'PARTIALLY_INVOICED' : 'NOT_INVOICED'
                            }
                        });
                    }
                }
                // Clear source order's invoiceNo if this was the only invoice
                if (dn?.sourceId) {
                    await prisma.salesOrder.updateMany({
                        where: {
                            id: dn.sourceId
                        },
                        data: {
                            invoiceNo: null,
                            status: 'SHIPPED'
                        }
                    });
                }
            }
            // Clear invoiceNo on PurchaseDeliveryNote when PURCHASE invoice is cancelled
            if (invoice.purchaseDeliveryNoteId && invoice.invoiceType === _invoiceenums.InvoiceType.PURCHASE) {
                const pDN = await prisma.purchaseDeliveryNote.findUnique({
                    where: {
                        id: invoice.purchaseDeliveryNoteId
                    },
                    select: {
                        sourceId: true
                    }
                });
                await prisma.purchaseDeliveryNote.update({
                    where: {
                        id: invoice.purchaseDeliveryNoteId
                    },
                    data: {
                        invoiceNo: null,
                        status: 'NOT_INVOICED'
                    }
                });
                // Clear source order's invoiceNo
                if (pDN?.sourceId) {
                    await prisma.procurementOrder.updateMany({
                        where: {
                            id: pDN.sourceId
                        },
                        data: {
                            invoiceNo: null,
                            // Fatura bağlantısı kalkınca sipariş tekrar kısmi teslim / işlem görür duruma alınır
                            status: _client.PurchaseOrderLocalStatus.PARTIAL
                        }
                    });
                }
            }
            // Cancel delivery note if requested
            if (cancelDeliveryNote && invoice.deliveryNoteId) {
                const deliveryNote = await prisma.salesDeliveryNote.findUnique({
                    where: {
                        id: invoice.deliveryNoteId
                    }
                });
                if (deliveryNote) {
                    await prisma.salesDeliveryNote.update({
                        where: {
                            id: deliveryNote.id
                        },
                        data: {
                            status: 'CANCELLED'
                        }
                    });
                }
            }
            if (cancelDeliveryNote && invoice.purchaseDeliveryNoteId) {
                const deliveryNote = await prisma.purchaseDeliveryNote.findUnique({
                    where: {
                        id: invoice.purchaseDeliveryNoteId
                    }
                });
                if (deliveryNote) {
                    await prisma.purchaseDeliveryNote.update({
                        where: {
                            id: deliveryNote.id
                        },
                        data: {
                            status: 'CANCELLED'
                        }
                    });
                }
            }
            // Audit log (inside transaction)
            await this.createLog(id, 'CANCELLATION', userId, {
                oldStatus: invoice.status,
                newStatus: _invoiceenums.InvoiceStatus.CANCELLED,
                cancelDeliveryNote
            }, ipAddress, userAgent, prisma);
            return updated;
        });
        // Recalculate status cascade after cancellation
        if (invoice.deliveryNoteId && tenantId) {
            await this.statusCalculator.recalculateCascade(invoice.deliveryNoteId, String(tenantId)).catch((err)=>console.error('[InvoiceService] Recalculate cascade after cancel failed:', err?.message));
        }
        if (invoice.purchaseDeliveryNoteId && tenantId) {
            await this.statusCalculator.recalculatePurchaseCascade(invoice.purchaseDeliveryNoteId, String(tenantId)).catch((err)=>console.error('[InvoiceService] Recalculate purchase cascade after cancel failed:', err?.message));
        }
        return cancelledInvoice;
    }
    async changeStatus(id, newStatus, userId, ipAddress, userAgent, tx) {
        const invoice = await this.findOne(id);
        const oldStatus = invoice.status;
        if (oldStatus === newStatus) {
            throw new _common.BadRequestException('Invoice is already in this status.');
        }
        const executeWork = async (prisma)=>{
            // If old status was APPROVED, revert movements using new orchestration logic
            if (oldStatus === _invoiceenums.InvoiceStatus.APPROVED) {
                const isDraftRevert = newStatus === _invoiceenums.InvoiceStatus.DRAFT || newStatus === _invoiceenums.InvoiceStatus.PENDING;
                await this.stockEffectService.reverseStockEffects(id, invoice.tenantId, prisma, isDraftRevert);
                await this.accountEffectService.reverseAccountEffect(id, invoice.tenantId, prisma, isDraftRevert);
            }
            // If new status is APPROVED, create movements using new orchestration logic
            if (newStatus === _invoiceenums.InvoiceStatus.APPROVED) {
                if (invoice.invoiceType === _invoiceenums.InvoiceType.SALE) {
                    try {
                        await this.invoiceProfitService.recalculateProfit(id, userId);
                    } catch (error) {
                        console.error('Profit calculation error:', error);
                    }
                }
                // Apply Stock and Account Effects via new services
                await this.stockEffectService.applyStockEffects(invoice, prisma, 'APPROVE');
                await this.accountEffectService.applyAccountEffect(invoice, prisma, 'APPROVE');
            }
            // If new status is CANCELLED (Modern Cancellation)
            if (newStatus === _invoiceenums.InvoiceStatus.CANCELLED) {
                // Cari etkisi her zaman ters çevrilir
                await this.accountEffectService.applyAccountEffect(invoice, prisma, 'CANCEL');
                // Stok etkisi: SADECE iade faturalarında
                const isReturnInvoice = [
                    _invoiceenums.InvoiceType.SALES_RETURN,
                    _invoiceenums.InvoiceType.PURCHASE_RETURN
                ].includes(invoice.invoiceType);
                if (isReturnInvoice) {
                    await this.stockEffectService.applyStockEffects(invoice, prisma, 'CANCEL');
                }
            }
            // Update status
            const updated = await prisma.invoice.update({
                where: {
                    id
                },
                data: {
                    status: newStatus,
                    updatedBy: userId
                }
            });
            // Audit log (inside transaction)
            await this.createLog(id, 'STATUS_CHANGE', userId, {
                oldStatus,
                newStatus
            }, ipAddress, userAgent, prisma);
            return updated;
        };
        if (tx) {
            return executeWork(tx);
        }
        const result = await this.prisma.$transaction(async (prisma)=>{
            return executeWork(prisma);
        });
        return result;
    }
    async getDueDateAnalysis(accountId) {
        // Only APPROVED and not CLOSED (unpaid/partially paid) invoices
        const where = {
            deletedAt: null,
            status: _invoiceenums.InvoiceStatus.APPROVED,
            payableAmount: {
                gt: 0.01
            }
        };
        if (accountId) {
            where.accountId = accountId;
        }
        const invoices = await this.prisma.invoice.findMany({
            where,
            include: {
                account: {
                    select: {
                        id: true,
                        code: true,
                        title: true,
                        type: true
                    }
                }
            },
            orderBy: [
                {
                    dueDate: 'asc'
                },
                {
                    date: 'asc'
                }
            ]
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const analysis = invoices.map((invoice)=>{
            const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date(invoice.date);
            dueDate.setHours(0, 0, 0, 0);
            const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            let dueDateStatus;
            if (daysRemaining < 0) {
                dueDateStatus = 'PAST';
            } else if (daysRemaining === 0) {
                dueDateStatus = 'TODAY';
            } else if (daysRemaining <= 7) {
                dueDateStatus = 'UPCOMING';
            } else {
                dueDateStatus = 'NORMAL';
            }
            return {
                id: invoice.id,
                invoiceNo: invoice.invoiceNo,
                invoiceType: invoice.invoiceType,
                account: invoice.account,
                date: invoice.date,
                dueDate: invoice.dueDate,
                grandTotal: invoice.grandTotal,
                paidAmount: invoice.paidAmount,
                payableAmount: invoice.payableAmount,
                daysRemaining,
                dueDateStatus,
                daysPassed: daysRemaining < 0 ? Math.abs(daysRemaining) : 0
            };
        });
        const summary = {
            total: analysis.length,
            totalAmount: analysis.reduce((sum, f)=>sum + Number(f.grandTotal), 0),
            totalPayableAmount: analysis.reduce((sum, f)=>sum + Number(f.payableAmount), 0),
            pastDue: {
                count: analysis.filter((f)=>f.dueDateStatus === 'PAST').length,
                amount: analysis.filter((f)=>f.dueDateStatus === 'PAST').reduce((sum, f)=>sum + Number(f.payableAmount), 0)
            },
            dueToday: {
                count: analysis.filter((f)=>f.dueDateStatus === 'TODAY').length,
                amount: analysis.filter((f)=>f.dueDateStatus === 'TODAY').reduce((sum, f)=>sum + Number(f.payableAmount), 0)
            },
            upcoming: {
                count: analysis.filter((f)=>f.dueDateStatus === 'UPCOMING').length,
                amount: analysis.filter((f)=>f.dueDateStatus === 'UPCOMING').reduce((sum, f)=>sum + Number(f.payableAmount), 0)
            },
            normalInvoices: {
                count: analysis.filter((f)=>f.dueDateStatus === 'NORMAL').length,
                amount: analysis.filter((f)=>f.dueDateStatus === 'NORMAL').reduce((sum, f)=>sum + Number(f.payableAmount), 0)
            }
        };
        const accountSummary = accountId ? null : await this.getAccountBasedDueDateSummary(analysis);
        return {
            summary,
            accountSummary,
            invoices: analysis
        };
    }
    async getAccountBasedDueDateSummary(analysis) {
        // Group by account
        const accountMap = new Map();
        analysis.forEach((invoice)=>{
            const accountId = invoice.account.id;
            if (!accountMap.has(accountId)) {
                accountMap.set(accountId, {
                    account: invoice.account,
                    totalInvoices: 0,
                    totalRemaining: 0,
                    pastDueCount: 0,
                    pastDueAmount: 0
                });
            }
            const accountData = accountMap.get(accountId);
            accountData.totalInvoices += 1;
            accountData.totalRemaining += Number(invoice.payableAmount);
            if (invoice.dueDateStatus === 'PAST') {
                accountData.pastDueCount += 1;
                accountData.pastDueAmount += Number(invoice.payableAmount);
            }
        });
        return Array.from(accountMap.values()).sort((a, b)=>b.pastDueAmount - a.pastDueAmount);
    }
    /**
   * Malzeme Hazırlama Fişi - Depo görevlileri için
   * Invoice itemsindeki ürünlerin hangi rafta olduğunu gösterir
   */ async getMaterialPreparationSlip(invoiceId) {
        // Get invoice and its items
        const invoice = await this.prisma.invoice.findUnique({
            where: {
                id: invoiceId
            },
            include: {
                account: {
                    select: {
                        id: true,
                        code: true,
                        title: true,
                        phone: true,
                        address: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                unit: true,
                                shelf: true,
                                barcode: true,
                                brand: true,
                                model: true
                            }
                        }
                    },
                    orderBy: {
                        product: {
                            code: 'asc'
                        }
                    }
                }
            }
        });
        if (!invoice) {
            throw new _common.NotFoundException('Invoice not found');
        }
        // Get shelf locations for each product (new system)
        const itemsWithShelf = await Promise.all(invoice.items.map(async (item)=>{
            // Get shelf info from ProductLocationStock
            const shelfInfo = await this.prisma.productLocationStock.findMany({
                where: {
                    productId: item.productId,
                    qtyOnHand: {
                        gt: 0
                    }
                },
                include: {
                    location: {
                        select: {
                            id: true,
                            code: true,
                            barcode: true,
                            name: true,
                            layer: true,
                            corridor: true,
                            side: true,
                            section: true,
                            level: true
                        }
                    },
                    warehouse: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    }
                },
                orderBy: [
                    {
                        qtyOnHand: 'desc'
                    },
                    {
                        location: {
                            code: 'asc'
                        }
                    }
                ]
            });
            return {
                productId: item.productId,
                productCode: item.product.code,
                productName: item.product.name,
                unit: item.product.unit,
                barcode: item.product.barcode,
                brand: item.product.brand,
                model: item.product.model,
                requestedQuantity: item.quantity,
                unitPrice: item.unitPrice,
                vatRate: item.vatRate,
                // Shelf info
                legacyShelf: item.product.shelf,
                shelves: shelfInfo.map((shelf)=>({
                        warehouseCode: shelf.warehouse.code,
                        warehouseName: shelf.warehouse.name,
                        shelfCode: shelf.location.code,
                        shelfBarcode: shelf.location.barcode,
                        shelfDescription: shelf.location.name,
                        layer: shelf.location.layer,
                        corridor: shelf.location.corridor,
                        side: shelf.location.side,
                        section: shelf.location.section,
                        level: shelf.location.level,
                        onHandQuantity: shelf.qtyOnHand
                    })),
                totalOnHandQuantity: shelfInfo.reduce((sum, shelf)=>sum + shelf.qtyOnHand, 0),
                totalShelfCount: shelfInfo.length
            };
        }));
        return {
            invoice: {
                id: invoice.id,
                invoiceNo: invoice.invoiceNo,
                invoiceType: invoice.invoiceType,
                date: invoice.date,
                dueDate: invoice.dueDate,
                status: invoice.status,
                totalAmount: invoice.totalAmount,
                vatAmount: invoice.vatAmount,
                grandTotal: invoice.grandTotal,
                notes: invoice.notes
            },
            account: invoice.account,
            items: itemsWithShelf,
            preparationInfo: {
                totalItemCount: itemsWithShelf.length,
                totalUnitCount: itemsWithShelf.reduce((sum, k)=>sum + k.requestedQuantity, 0),
                missingProducts: itemsWithShelf.filter((k)=>k.totalOnHandQuantity < k.requestedQuantity),
                completeProducts: itemsWithShelf.filter((k)=>k.totalOnHandQuantity >= k.requestedQuantity)
            },
            generationDate: new Date()
        };
    }
    /**
   * E-Invoice gönder - Hızlı Teknoloji API'sine fatura gönderir
   */ async sendEInvoice(invoiceId, hizliService, userId) {
        // Get invoice data
        const invoice = await this.findOne(invoiceId);
        if (!invoice) {
            throw new _common.NotFoundException(`Invoice not found: ${invoiceId}`);
        }
        if (invoice.invoiceType !== _invoiceenums.InvoiceType.SALE) {
            throw new _common.BadRequestException('Only sales invoices can be sent as e-invoices');
        }
        if (invoice.status === _invoiceenums.InvoiceStatus.CANCELLED) {
            throw new _common.BadRequestException('Cancelled invoices cannot be sent as e-invoices');
        }
        // Check account info
        if (!invoice.account.taxNumber && !invoice.account.nationalId) {
            throw new _common.BadRequestException('Tax number or National ID not found in account info');
        }
        const customerIdentifier = invoice.account.taxNumber || invoice.account.nationalId;
        try {
            // 1. Get recipient URN info (GetGibUserList)
            let destinationUrn = '';
            try {
                const gibUserList = await hizliService.getGibUserList(1, 'PK', customerIdentifier);
                // REST API response format check
                if (gibUserList?.IsSucceeded && gibUserList?.gibUserLists && Array.isArray(gibUserList.gibUserLists) && gibUserList.gibUserLists.length > 0) {
                    destinationUrn = gibUserList.gibUserLists[0].Alias || '';
                    console.log(`✅ Recipient URN found: ${destinationUrn} (Identifier: ${customerIdentifier})`);
                } else if (gibUserList?.IsSucceeded === false) {
                    throw new _common.BadRequestException(`Recipient URN info could not be retrieved: ${gibUserList?.Message || 'GIB user list empty or not found'}`);
                } else {
                    throw new _common.BadRequestException(`Recipient URN info not found. GIB user list empty (Identifier: ${customerIdentifier})`);
                }
            } catch (error) {
                const errorMessage = error.message || error.response?.data?.message || 'Unknown error';
                throw new _common.BadRequestException(`Recipient URN info could not be retrieved: ${errorMessage}`);
            }
            // 2. Map invoice data to Hizli Teknoloji format
            const invoiceModel = this.mapToHizliFormat(invoice, destinationUrn);
            // 3. Create InputInvoiceModel
            const inputInvoice = {
                AppType: 1,
                SourceUrn: process.env.HIZLI_GB_URN || 'urn:mail:defaultgb@hizlibilisimteknolojileri.net',
                DestinationIdentifier: customerIdentifier,
                DestinationUrn: destinationUrn,
                IsDraft: false,
                IsDraftSend: false,
                IsPreview: false,
                LocalId: null,
                UpdateDocument: false,
                InvoiceModel: invoiceModel
            };
            // 4. Send via sendInvoiceModel
            const result = await hizliService.sendInvoiceModel([
                inputInvoice
            ]);
            // 5. Check result and save to DB
            if (result && result.length > 0 && result[0].IsSucceeded) {
                // Success - update e-invoice status
                await this.prisma.invoice.update({
                    where: {
                        id: invoiceId
                    },
                    data: {
                        eInvoiceStatus: 'SENT',
                        eInvoiceEttn: result[0].UUID || null,
                        updatedBy: userId
                    }
                });
                // Audit log
                await this.createLog(invoiceId, 'EINVOICE_SEND', userId, {
                    ettn: result[0].UUID,
                    message: result[0].Message
                });
                return {
                    success: true,
                    message: result[0].Message || 'E-invoice sent successfully',
                    ettn: result[0].UUID,
                    data: result[0]
                };
            } else {
                // Failed
                const errorMessage = result && result.length > 0 ? result[0].Message : 'Unknown error';
                await this.prisma.invoice.update({
                    where: {
                        id: invoiceId
                    },
                    data: {
                        eInvoiceStatus: 'ERROR',
                        updatedBy: userId
                    }
                });
                await this.createLog(invoiceId, 'EINVOICE_SEND_ERROR', userId, {
                    error: errorMessage
                });
                throw new _common.BadRequestException(`E-invoice could not be sent: ${errorMessage}`);
            }
        } catch (error) {
            // On error, update status
            await this.prisma.invoice.update({
                where: {
                    id: invoiceId
                },
                data: {
                    eInvoiceStatus: 'ERROR',
                    updatedBy: userId
                }
            });
            await this.createLog(invoiceId, 'EINVOICE_SEND_ERROR', userId, {
                error: error.message
            });
            throw error;
        }
    }
    /**
   * Maps invoice data to Hizli Teknoloji format.
   */ mapToHizliFormat(invoice, destinationUrn) {
        const issueDate = new Date(invoice.date || new Date());
        const issueDateStr = issueDate.toISOString().split('T')[0];
        const issueTimeStr = issueDate.toTimeString().split(' ')[0]; // HH:mm:ss
        // Generate UUID if not exists
        const uuid = invoice.eInvoiceEttn || this.generateUUID();
        // Invoice Lines
        const invoiceLines = invoice.items.map((item, index)=>{
            const unitPrice = Number(item.unitPrice);
            const quantity = Number(item.quantity);
            const amount = unitPrice * quantity;
            const vatRate = Number(item.vatRate || 0);
            const vatAmount = amount * vatRate / 100;
            // Unit code (C62 = Piece)
            const unitCode = this.mapBirimToUnitCode(item.product?.unit || 'ADET');
            return {
                ID: index + 1,
                Item_Name: item.product?.name || 'Item/Service',
                Quantity_Amount: quantity,
                Quantity_Unit_User: unitCode,
                Price_Amount: unitPrice,
                Price_Total: amount,
                Allowance_Percent: Number(item.discountRate || 0),
                Allowance_Amount: Number(item.discountAmount || 0),
                Allowance_Reason: null,
                Item_ID_Buyer: null,
                Item_ID_Seller: item.product?.code || null,
                Item_Description: item.product?.description || null,
                Item_Brand: item.product?.brand || null,
                Item_Model: item.product?.model || null,
                Item_Classification: null,
                LineNote: null,
                LineCurrencyCode: null,
                Manufacturers_ItemIdentification: null,
                exportLine: null,
                lineTaxes: [
                    {
                        Tax_Code: '0015',
                        Tax_Name: 'KDV',
                        Tax_Base: amount,
                        Tax_Perc: vatRate,
                        Tax_Amnt: vatAmount,
                        Tax_Exem: '',
                        Tax_Exem_Code: ''
                    }
                ]
            };
        });
        // Customer info
        const customer = {
            IdentificationID: invoice.account.taxNumber || invoice.account.nationalId || '',
            PartyName: invoice.account.title || '',
            TaxSchemeName: invoice.account.taxOffice || '',
            CountryName: invoice.account.country || 'TURKEY',
            CityName: invoice.account.city || '',
            CitySubdivisionName: invoice.account.district || '',
            StreetName: invoice.account.address || '',
            PostalZone: null,
            ElectronicMail: invoice.account.email || null,
            Telephone: invoice.account.phone || null,
            Telefax: null,
            WebsiteURI: null,
            Person_FirstName: invoice.account.companyType === 'INDIVIDUAL' ? invoice.account.fullName?.split(' ')[0] || '' : '',
            Person_FamilyName: invoice.account.companyType === 'INDIVIDUAL' ? invoice.account.fullName?.split(' ').slice(1).join(' ') || '' : '',
            customerIdentificationsOther: []
        };
        // Invoice Header
        const invoiceHeader = {
            UUID: uuid,
            Invoice_ID: invoice.invoiceNo,
            ProfileID: 'TICARIFATURA',
            InvoiceTypeCode: 'SALE',
            IssueDate: issueDateStr,
            IssueTime: issueTimeStr,
            DocumentCurrencyCode: 'TRY',
            CalculationRate: 1,
            XSLT_Adi: 'general',
            XSLT_Doc: null,
            LineExtensionAmount: Number(invoice.totalAmount),
            AllowanceTotalAmount: Number(invoice.discount || 0),
            TaxInclusiveAmount: Number(invoice.totalAmount) + Number(invoice.vatAmount),
            PayableAmount: Number(invoice.grandTotal),
            Note: invoice.notes || '',
            Notes: invoice.notes ? [
                {
                    Note: invoice.notes
                }
            ] : [],
            OrderReferenceId: invoice.orderNo || null,
            OrderReferenceDate: invoice.orderNo ? issueDateStr : null,
            IsInternetSale: false,
            IsInternet_PaymentMeansCode: null,
            IsInternet_PaymentDueDate: null,
            IsInternet_InstructionNote: null,
            IsInternet_WebsiteURI: null,
            IsInternet_Delivery_TcknVkn: null,
            IsInternet_Delivery_PartyName: null,
            IsInternet_Delivery_FirstName: null,
            IsInternet_Delivery_FamilyName: null,
            IsInternet_ActualDespatchDate: null,
            Sgk_AccountingCost: null,
            Sgk_Period_StartDate: null,
            Sgk_Period_EndDate: null,
            Sgk_Mukellef_Kodu: null,
            Sgk_Mukellef_Adi: null,
            Sgk_DosyaNo: null
        };
        // Payment Means (Ödeme bilgileri)
        const paymentMeans = invoice.dueDate ? [
            {
                PaymentMeansCode: 'ZZZ',
                InstructionNote: '-',
                PaymentChannelCode: '',
                PaymentDueDate: new Date(invoice.dueDate).toISOString(),
                PayeeFinancialAccount: null,
                PayeeFinancialCurrencyCode: 'TRY'
            }
        ] : [];
        return {
            invoiceheader: invoiceHeader,
            customer: customer,
            invoiceLines: invoiceLines,
            paymentMeans: paymentMeans,
            supplier: null,
            supplierAgent: null,
            customerAgent: null,
            additionalDocumentReferences: [],
            despatchs: []
        };
    }
    /**
   * Birim kodunu Hızlı Teknoloji unit code'una çevirir
   */ mapBirimToUnitCode(birim) {
        const birimMap = {
            ADET: 'C62',
            KG: 'KGM',
            TON: 'TNE',
            LITRE: 'LTR',
            METRE: 'MTR',
            M2: 'MTK',
            M3: 'MTQ',
            PAKET: 'PK',
            KUTU: 'CT',
            PALET: 'PF'
        };
        return birimMap[birim.toUpperCase()] || 'C62'; // Varsayılan: Adet
    }
    /**
   * UUID oluşturur
   */ generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c)=>{
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
    }
    /**
   * Satış invoicesı istatistikleri (Summary Cards)
   */ /**
   * Sales invoice statistics (Summary Cards)
   */ async getSalesStats(invoiceType) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const baseWhere = {
            deletedAt: null,
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            ...invoiceType && {
                invoiceType
            }
        };
        // Only approved/partially paid/closed invoices
        const approvedStatuses = [
            _invoiceenums.InvoiceStatus.APPROVED,
            _invoiceenums.InvoiceStatus.PARTIALLY_PAID,
            _invoiceenums.InvoiceStatus.CLOSED
        ];
        // Monthly total sales (approved only)
        const monthlyStats = await this.prisma.invoice.aggregate({
            where: {
                ...baseWhere,
                date: {
                    gte: startOfMonth
                },
                status: {
                    in: approvedStatuses
                }
            },
            _sum: {
                grandTotal: true
            },
            _count: true
        });
        // Pending collection (approved or partially paid)
        const pendingStats = await this.prisma.invoice.aggregate({
            where: {
                ...baseWhere,
                status: {
                    in: [
                        _invoiceenums.InvoiceStatus.APPROVED,
                        _invoiceenums.InvoiceStatus.PARTIALLY_PAID
                    ]
                }
            },
            _sum: {
                grandTotal: true
            },
            _count: true
        });
        // Overdue (approved, partially paid, dueDate < now)
        const overdueStats = await this.prisma.invoice.aggregate({
            where: {
                ...baseWhere,
                dueDate: {
                    lt: now
                },
                status: {
                    in: [
                        _invoiceenums.InvoiceStatus.APPROVED,
                        _invoiceenums.InvoiceStatus.PARTIALLY_PAID
                    ]
                }
            },
            _sum: {
                grandTotal: true
            },
            _count: true
        });
        return {
            monthlySales: {
                amount: monthlyStats._sum.grandTotal || 0,
                count: monthlyStats._count || 0
            },
            pendingCollection: {
                amount: pendingStats._sum.grandTotal || 0,
                count: pendingStats._count || 0
            },
            overdue: {
                amount: overdueStats._sum.grandTotal || 0,
                count: overdueStats._count || 0
            }
        };
    }
    /**
   * TCMB döviz kurunu getirir
   */ async getExchangeRate(currency) {
        return this.tcmbService.getCurrentRate(currency);
    }
    /**
   * Müşteri bazlı fiyat geçmişi
   */ /**
   * Price history based on customer
   */ async getPriceHistory(accountId, productId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const items = await this.prisma.invoiceItem.findMany({
            where: {
                productId,
                invoice: {
                    accountId,
                    invoiceType: _invoiceenums.InvoiceType.SALE,
                    deletedAt: null,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            },
            include: {
                invoice: {
                    select: {
                        invoiceNo: true,
                        date: true
                    }
                }
            },
            orderBy: {
                invoice: {
                    date: 'desc'
                }
            },
            take: 10
        });
        return items.map((k)=>({
                invoiceNo: k.invoice.invoiceNo,
                date: k.invoice.date,
                unitPrice: k.unitPrice,
                quantity: k.quantity,
                amount: k.amount
            }));
    }
    /**
   * Toplu status güncelleme
   */ /**
   * Bulk status update
   */ async bulkUpdateStatus(ids, status, userId) {
        const results = [];
        for (const id of ids){
            try {
                await this.changeStatus(id, status, userId);
                results.push({
                    id,
                    success: true
                });
            } catch (error) {
                results.push({
                    id,
                    success: false,
                    message: error.message
                });
            }
        }
        return {
            total: ids.length,
            successful: results.filter((r)=>r.success).length,
            failed: results.filter((r)=>!r.success).length,
            results
        };
    }
    /**
   * List invoices with advanced filtering
   */ async findAllAdvanced(page = 1, limit = 50, invoiceType, search, accountId, sortBy, sortOrder, startDate, endDate, status, salesAgentId) {
        const skip = (page - 1) * limit;
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            deletedAt: null,
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (invoiceType) where.invoiceType = invoiceType;
        if (accountId) where.accountId = accountId;
        if (salesAgentId) where.salesAgentId = salesAgentId;
        // Date range filter
        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.date.lte = end;
            }
        }
        // Status filter (comma separated: APPROVED,PARTIALLY_PAID)
        if (status) {
            const statuses = status.split(',').map((d)=>d.trim());
            where.status = {
                in: statuses
            };
        }
        if (search) {
            where.OR = [
                {
                    invoiceNo: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    account: {
                        title: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    account: {
                        code: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }
        // Sorting
        let orderBy = {
            createdAt: 'desc'
        };
        if (sortBy) {
            if (sortBy === 'account') {
                orderBy = {
                    account: {
                        title: sortOrder || 'asc'
                    }
                };
            } else {
                const sortFieldMap = {
                    invoiceNo: 'invoiceNo',
                    invoiceType: 'invoiceType',
                    status: 'status',
                    date: 'date',
                    grandTotal: 'grandTotal',
                    paidAmount: 'paidAmount'
                };
                orderBy = {
                    [sortFieldMap[sortBy] || sortBy]: sortOrder || 'desc'
                };
            }
        }
        const [data, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                include: {
                    account: {
                        select: {
                            id: true,
                            code: true,
                            title: true,
                            type: true
                        }
                    },
                    deliveryNote: {
                        select: {
                            id: true,
                            deliveryNoteNo: true,
                            sourceOrder: {
                                select: {
                                    id: true,
                                    orderNo: true
                                }
                            }
                        }
                    },
                    invoiceCollections: {
                        include: {
                            collection: {
                                select: {
                                    id: true,
                                    date: true,
                                    type: true,
                                    paymentType: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    },
                    createdByUser: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true
                        }
                    },
                    updatedByUser: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true
                        }
                    },
                    salesAgent: {
                        select: {
                            id: true,
                            fullName: true
                        }
                    },
                    _count: {
                        select: {
                            items: true
                        }
                    }
                },
                orderBy
            }),
            this.prisma.invoice.count({
                where
            })
        ]);
        return {
            data: data.map((item)=>{
                const account = item.account ? {
                    id: item.account.id,
                    accountCode: item.account.code,
                    title: item.account.title,
                    type: item.account.type
                } : null;
                const deliveryNote = item.deliveryNote ? {
                    id: item.deliveryNote.id,
                    deliveryNoteNo: item.deliveryNote.deliveryNoteNo,
                    sourceOrder: item.deliveryNote.sourceOrder ? {
                        id: item.deliveryNote.sourceOrder.id,
                        orderNo: item.deliveryNote.sourceOrder.orderNo
                    } : null
                } : null;
                const invoiceCollections = (item.invoiceCollections || []).map((ic)=>({
                        ...ic,
                        collection: ic.collection ? {
                            id: ic.collection.id,
                            date: ic.collection.date,
                            type: ic.collection.type,
                            paymentType: ic.collection.paymentType
                        } : null
                    }));
                return {
                    ...item,
                    account,
                    deliveryNote,
                    invoiceCollections,
                    remainingAmount: Number(item.grandTotal) - Number(item.paidAmount || 0)
                };
            }),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
   * Get multiple invoices by IDs (for bulk printing)
   */ async findManyByIds(ids) {
        return this.prisma.invoice.findMany({
            where: {
                id: {
                    in: ids
                },
                deletedAt: null
            },
            include: {
                account: true,
                items: {
                    include: {
                        product: true
                    }
                },
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true
                    }
                }
            }
        });
    }
    /**
   * Reverse warehouse stock for a single product (used when reversing an approved invoice)
   */ async reverseWarehouseStockForInvoice(warehouseId, productId, quantity, invoiceType, prisma) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const wmsParam = await prisma.systemParameter.findFirst({
            where: {
                key: 'ENABLE_WMS_MODULE',
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            orderBy: {
                tenantId: 'desc'
            }
        });
        if (wmsParam?.value !== 'true' && wmsParam?.value !== true) return;
        const defaultLocation = await this.warehouseService.getOrCreateDefaultLocation(warehouseId);
        const stock = await prisma.productLocationStock.findFirst({
            where: {
                warehouseId,
                locationId: defaultLocation.id,
                productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!stock) return;
        // SALE had SALE (decrement) -> reverse = increment. PURCHASE had ENTRY (increment) -> reverse = decrement.
        const qtyChange = invoiceType === _invoiceenums.InvoiceType.SALE || invoiceType === _invoiceenums.InvoiceType.PURCHASE_RETURN ? quantity : -quantity;
        await prisma.productLocationStock.update({
            where: {
                id: stock.id
            },
            data: {
                qtyOnHand: {
                    increment: qtyChange
                }
            }
        });
    }
    /**
   * SALES/PURCHASE iptal için sadece cari geri alır (product hareketi oluşturmaz).
   * Stok hesaplaması iptal faturaları dikkate almadığı için ek kayıt gerekmez.
   */ /**
   * Only reverses account movements for SALE/PURCHASE cancellation.
   */ async reverseAccountOnlyForInvoice(invoice, prisma, tenantId) {
        const grandTotal = Number(invoice.grandTotal);
        await prisma.accountMovement.deleteMany({
            where: {
                accountId: invoice.accountId,
                documentType: 'INVOICE',
                documentNo: invoice.invoiceNo,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        const balanceUpdate = invoice.invoiceType === _invoiceenums.InvoiceType.SALE || invoice.invoiceType === _invoiceenums.InvoiceType.PURCHASE_RETURN ? {
            decrement: grandTotal
        } : {
            increment: grandTotal
        };
        await prisma.account.updateMany({
            where: {
                id: invoice.accountId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            data: {
                balance: balanceUpdate
            }
        });
    }
    /**
   * Reverse cari and product movements for an already-approved invoice (used before re-applying on edit or on iptal)
   * @param useIptalTipi - true: hareketlerde IPTAL_GIRIS/IPTAL_CIKIS kullan (iptal için); false: IADE/CIKIS kullan (status değişikliği için)
   */ async reverseInvoiceMovements(invoice, prisma, tenantId, useCancelType = false) {
        if (!invoice.items?.length) return;
        // Prevent duplicate stock entry: If cancellation movements already exist for this invoice, do nothing
        if (useCancelType) {
            const validItemCount = invoice.items.filter((k)=>k.productId && (Number(k.quantity) || 0) > 0).length;
            if (validItemCount > 0) {
                const existingCancelCount = await prisma.productMovement.count({
                    where: {
                        notes: `Invoice Cancellation: ${invoice.invoiceNo}`,
                        movementType: {
                            in: [
                                'CANCELLATION_ENTRY',
                                'CANCELLATION_EXIT'
                            ]
                        },
                        ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                    }
                });
                if (existingCancelCount >= validItemCount) {
                    return; // Cancellation movements already created, skip to avoid duplicates
                }
            }
        }
        const grandTotal = Number(invoice.grandTotal);
        const rawWh = invoice.warehouseId;
        const transactionWarehouseId = rawWh && String(rawWh).trim() ? String(rawWh).trim() : undefined;
        // 1. Delete account movement for this invoice
        await prisma.accountMovement.deleteMany({
            where: {
                accountId: invoice.accountId,
                documentType: 'INVOICE',
                documentNo: invoice.invoiceNo,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        // 2. Reverse account balance
        const balanceUpdate = invoice.invoiceType === _invoiceenums.InvoiceType.SALE || invoice.invoiceType === _invoiceenums.InvoiceType.PURCHASE_RETURN ? {
            decrement: grandTotal
        } : {
            increment: grandTotal
        };
        await prisma.account.updateMany({
            where: {
                id: invoice.accountId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            data: {
                balance: balanceUpdate
            }
        });
        const effectiveTenantId = tenantId ?? invoice.tenantId ?? undefined;
        const description = useCancelType ? `Invoice Cancellation: ${invoice.invoiceNo}` : `Invoice update (reversal): ${invoice.invoiceNo}`;
        // 3. Revert warehouse stock and Delete old movements
        for (const item of invoice.items){
            if (!item.productId) continue;
            const quantity = Number(item.quantity) || 0;
            if (quantity <= 0) continue;
            // Revert warehouse stock when WMS enabled
            if (transactionWarehouseId) {
                await this.reverseWarehouseStockForInvoice(transactionWarehouseId, item.productId, quantity, invoice.invoiceType, prisma);
            }
        }
        if (useCancelType) {
            // Cancellation case: For SATIS/ALIS, we don't want history of movements, just delete original ones.
            // If it were RETURN type, we might keep them, but per rules "Do NOT create stock movement" for SATIS/ALIS cancellation.
            const itemIds = invoice.items?.map((item)=>item.id).filter(Boolean) || [];
            if (itemIds.length > 0) {
                await prisma.productMovement.deleteMany({
                    where: {
                        invoiceItemId: {
                            in: itemIds
                        },
                        ...(0, _stagingutil.buildTenantWhereClause)(effectiveTenantId)
                    }
                });
            }
            await prisma.stockMove.deleteMany({
                where: {
                    refId: invoice.id,
                    refType: 'Invoice',
                    ...(0, _stagingutil.buildTenantWhereClause)(effectiveTenantId)
                }
            });
        } else {
            // Update case: Delete old movements (they will be rebuilt in processInvoiceMovements)
            const itemIds = invoice.items?.map((item)=>item.id).filter(Boolean) || [];
            if (itemIds.length > 0) {
                await prisma.productMovement.deleteMany({
                    where: {
                        invoiceItemId: {
                            in: itemIds
                        },
                        ...(0, _stagingutil.buildTenantWhereClause)(effectiveTenantId)
                    }
                });
            }
            await prisma.stockMove.deleteMany({
                where: {
                    refId: invoice.id,
                    refType: 'Invoice',
                    ...(0, _stagingutil.buildTenantWhereClause)(effectiveTenantId)
                }
            });
        }
        // SALE with deliveryNoteId may have used delivery note warehouseId
        if (invoice.invoiceType === _invoiceenums.InvoiceType.SALE && invoice.deliveryNoteId && !transactionWarehouseId) {
            const salesDeliveryNote = await prisma.salesDeliveryNote.findFirst({
                where: {
                    id: invoice.deliveryNoteId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                select: {
                    warehouseId: true
                }
            });
            if (salesDeliveryNote?.warehouseId) {
                for (const item of invoice.items){
                    if (!item.productId) continue;
                    const quantity = Number(item.quantity) || 0;
                    if (quantity <= 0) continue;
                    await this.reverseWarehouseStockForInvoice(salesDeliveryNote.warehouseId, item.productId, quantity, invoice.invoiceType, prisma);
                }
            }
        }
        // PURCHASE may use warehouseId from purchaseDeliveryNote
        if (invoice.invoiceType === _invoiceenums.InvoiceType.PURCHASE && !transactionWarehouseId && invoice.purchaseDeliveryNoteId) {
            const deliveryNote = await prisma.purchaseDeliveryNote.findFirst({
                where: {
                    id: invoice.purchaseDeliveryNoteId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                select: {
                    warehouseId: true
                }
            });
            if (deliveryNote?.warehouseId) {
                for (const item of invoice.items){
                    if (!item.productId) continue;
                    const quantity = Number(item.quantity) || 0;
                    if (quantity <= 0) continue;
                    await this.reverseWarehouseStockForInvoice(deliveryNote.warehouseId, item.productId, quantity, invoice.invoiceType, prisma);
                }
            }
        }
    }
    /**
   * Process and create Account and Stock movements for an approved invoice
   */ async processInvoiceMovements(invoice, prisma, userId, warehouseId, preparationSlips = [], tenantId) {
        console.log('[processInvoiceMovements] Started:', {
            invoiceId: invoice.id,
            invoiceNo: invoice.invoiceNo,
            invoiceType: invoice.invoiceType,
            itemsCount: invoice.items?.length ?? 0,
            warehouseId,
            tenantId
        });
        const currentAccount = await prisma.account.findFirst({
            where: {
                id: invoice.accountId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            select: {
                balance: true
            }
        });
        if (!currentAccount) throw new _common.NotFoundException('Account not found');
        const grandTotal = Number(invoice.grandTotal);
        const currentBalance = Number(currentAccount.balance ?? 0);
        let accountMovementType;
        let accountBalanceChange;
        let description;
        let balanceUpdate;
        if (invoice.invoiceType === _invoiceenums.InvoiceType.SALE) {
            accountMovementType = 'DEBIT';
            accountBalanceChange = currentBalance + grandTotal;
            description = invoice.notes || '';
            balanceUpdate = {
                increment: grandTotal
            };
        } else if (invoice.invoiceType === _invoiceenums.InvoiceType.SALES_RETURN) {
            accountMovementType = 'CREDIT';
            accountBalanceChange = currentBalance - grandTotal;
            description = invoice.notes || '';
            balanceUpdate = {
                decrement: grandTotal
            };
        } else if (invoice.invoiceType === _invoiceenums.InvoiceType.PURCHASE) {
            accountMovementType = 'CREDIT';
            accountBalanceChange = currentBalance - grandTotal;
            description = invoice.notes || '';
            balanceUpdate = {
                decrement: grandTotal
            };
        } else {
            // PURCHASE_RETURN
            accountMovementType = 'DEBIT';
            accountBalanceChange = currentBalance + grandTotal;
            description = invoice.notes || '';
            balanceUpdate = {
                increment: grandTotal
            };
        }
        // Use invoice.tenantId to ensure proper account movement creation
        const effectiveTenantId = invoice.tenantId || tenantId;
        if (!effectiveTenantId) {
            throw new _common.BadRequestException('Tenant ID is required for account movement creation');
        }
        // 1. Create Account Movement
        await prisma.accountMovement.create({
            data: {
                accountId: invoice.accountId,
                type: accountMovementType,
                amount: grandTotal,
                balance: accountBalanceChange,
                documentType: 'INVOICE',
                documentNo: invoice.invoiceNo,
                invoiceId: invoice.id,
                date: new Date(invoice.date),
                notes: description,
                tenantId: effectiveTenantId
            }
        });
        // 2. Update Account Balance
        await prisma.account.updateMany({
            where: {
                id: invoice.accountId,
                ...(0, _stagingutil.buildTenantWhereClause)(effectiveTenantId ?? undefined)
            },
            data: {
                balance: balanceUpdate
            }
        });
        // 3. Create Stock Movements
        const rawWh = warehouseId ?? invoice.warehouseId;
        const transactionWarehouseId = rawWh && String(rawWh).trim() ? String(rawWh).trim() : undefined;
        if (invoice.invoiceType === _invoiceenums.InvoiceType.SALE) {
            if (preparationSlips.length > 0) {
                for (const slip of preparationSlips){
                    const locationStock = await prisma.productLocationStock.findFirst({
                        where: {
                            productId: slip.orderItem.productId,
                            locationId: slip.locationId,
                            ...(0, _stagingutil.buildTenantWhereClause)(effectiveTenantId ?? undefined)
                        }
                    });
                    if (locationStock) {
                        await prisma.productLocationStock.updateMany({
                            where: {
                                id: locationStock.id,
                                ...(0, _stagingutil.buildTenantWhereClause)(effectiveTenantId ?? undefined)
                            },
                            data: {
                                qtyOnHand: {
                                    decrement: slip.quantity
                                },
                                updatedAt: new Date()
                            }
                        });
                    }
                    await prisma.stockMove.create({
                        data: {
                            productId: slip.orderItem.productId,
                            fromWarehouseId: locationStock?.warehouseId,
                            fromLocationId: slip.locationId,
                            toWarehouseId: locationStock.warehouseId,
                            toLocationId: slip.locationId,
                            qty: slip.quantity,
                            moveType: 'SALE',
                            refType: 'Invoice',
                            refId: invoice.id,
                            note: description,
                            createdBy: userId,
                            tenantId: effectiveTenantId
                        }
                    });
                }
            }
            const salesItems = Array.isArray(invoice.items) ? invoice.items : [];
            for (const item of salesItems){
                if (!item.productId) continue;
                await prisma.productMovement.create({
                    data: {
                        productId: item.productId,
                        movementType: 'SALE',
                        quantity: item.quantity,
                        unitPrice: Number(item.unitPrice),
                        notes: description,
                        warehouseId: transactionWarehouseId,
                        invoiceItemId: item.id,
                        ...effectiveTenantId && {
                            tenantId: effectiveTenantId
                        }
                    }
                });
            }
            if (preparationSlips.length === 0 && invoice.deliveryNoteId) {
                const salesDeliveryNote = await prisma.salesDeliveryNote.findFirst({
                    where: {
                        id: invoice.deliveryNoteId,
                        ...(0, _stagingutil.buildTenantWhereClause)(effectiveTenantId ?? undefined)
                    },
                    select: {
                        warehouseId: true
                    }
                });
                if (salesDeliveryNote?.warehouseId) {
                    for (const item of salesItems){
                        await this.updateWarehouseStock(salesDeliveryNote.warehouseId, item.productId, item.quantity, 'SALE', invoice.id, 'Invoice', description, userId, prisma);
                    }
                }
            }
            // Recalculate account balance after processing movements
            await this.accountBalanceService.recalculateAccountBalance(invoice.accountId, prisma);
        } else if (invoice.invoiceType === _invoiceenums.InvoiceType.SALES_RETURN) {
            const items = Array.isArray(invoice.items) ? invoice.items : [];
            for (const item of items){
                if (!item.productId) continue;
                await prisma.productMovement.create({
                    data: {
                        productId: item.productId,
                        movementType: 'ENTRY',
                        quantity: item.quantity,
                        unitPrice: Number(item.unitPrice),
                        notes: description,
                        warehouseId: transactionWarehouseId,
                        invoiceItemId: item.id,
                        ...effectiveTenantId && {
                            tenantId: effectiveTenantId
                        }
                    }
                });
                if (transactionWarehouseId) {
                    await this.updateWarehouseStock(transactionWarehouseId, item.productId, item.quantity, 'PUT_AWAY', invoice.id, 'Invoice', description, userId, prisma);
                }
            }
        } else if (invoice.invoiceType === _invoiceenums.InvoiceType.PURCHASE) {
            const purchaseItems = Array.isArray(invoice.items) ? invoice.items : [];
            for (const item of purchaseItems){
                if (!item.productId) continue;
                await prisma.productMovement.create({
                    data: {
                        productId: item.productId,
                        movementType: 'ENTRY',
                        quantity: item.quantity,
                        unitPrice: Number(item.unitPrice),
                        notes: description,
                        warehouseId: transactionWarehouseId,
                        invoiceItemId: item.id,
                        ...effectiveTenantId && {
                            tenantId: effectiveTenantId
                        }
                    }
                });
            }
            const whId = transactionWarehouseId || (invoice.purchaseDeliveryNoteId ? (await prisma.purchaseDeliveryNote.findFirst({
                where: {
                    id: invoice.purchaseDeliveryNoteId,
                    ...(0, _stagingutil.buildTenantWhereClause)(effectiveTenantId ?? undefined)
                },
                select: {
                    warehouseId: true
                }
            }))?.warehouseId : null);
            if (whId) {
                for (const item of purchaseItems){
                    await this.updateWarehouseStock(whId, item.productId, item.quantity, 'PUT_AWAY', invoice.id, 'Invoice', description, userId, prisma);
                }
            }
        } else if (invoice.invoiceType === _invoiceenums.InvoiceType.PURCHASE_RETURN) {
            const purchaseReturnItems = Array.isArray(invoice.items) ? invoice.items : [];
            for (const item of purchaseReturnItems){
                if (!item.productId) continue;
                await prisma.productMovement.create({
                    data: {
                        productId: item.productId,
                        movementType: 'EXIT',
                        quantity: item.quantity,
                        unitPrice: Number(item.unitPrice),
                        notes: description,
                        warehouseId: transactionWarehouseId || null,
                        invoiceItemId: item.id,
                        ...effectiveTenantId && {
                            tenantId: effectiveTenantId
                        }
                    }
                });
                if (transactionWarehouseId) {
                    await this.updateWarehouseStock(transactionWarehouseId, item.productId, item.quantity, 'SALE', invoice.id, 'Invoice', description, userId, prisma);
                }
            }
        }
    }
    async createPaymentPlan(invoiceId, plan) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        return this.prisma.$transaction(async (tx)=>{
            // Önce mevcut planı sil (tenant güvenliği ile)
            await tx.invoicePaymentPlan.deleteMany({
                where: {
                    invoiceId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            if (!plan || plan.length === 0) return {
                count: 0
            };
            // Yeni planı oluştur (alan eşleştirme ve tenantId ile)
            return tx.invoicePaymentPlan.createMany({
                data: plan.map((p)=>({
                        invoiceId,
                        tenantId,
                        dueDate: new Date(p.vade || p.dueDate),
                        amount: new _library.Decimal(p.tutar || p.amount || 0),
                        paymentType: p.odemeTipi || p.paymentType || null,
                        notes: p.aciklama || p.notes || null,
                        isPaid: Boolean(p.odendi || p.isPaid || false)
                    }))
            });
        });
    }
    async getPaymentPlan(invoiceId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const plans = await this.prisma.invoicePaymentPlan.findMany({
            where: {
                invoiceId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
        // Toplam ödenen ve bekleyen tutarları hesapla
        const totalPaid = plans.filter((p)=>p.isPaid).reduce((sum, p)=>sum + Number(p.amount), 0);
        const totalPending = plans.filter((p)=>!p.isPaid).reduce((sum, p)=>sum + Number(p.amount), 0);
        const totalAmount = plans.reduce((sum, p)=>sum + Number(p.amount), 0);
        return {
            plans,
            summary: {
                totalInstallments: plans.length,
                totalAmount,
                totalPaid,
                totalPending,
                paidCount: plans.filter((p)=>p.isPaid).length,
                pendingCount: plans.filter((p)=>!p.isPaid).length
            }
        };
    }
    async updatePaymentPlanItem(planId, isPaid) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.invoicePaymentPlan.update({
            where: {
                id: planId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            data: {
                isPaid
            }
        });
    }
    async recalculateCariBakiyeler(accountId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            deletedAt: null
        };
        if (accountId) where.id = accountId;
        const accounts = await this.prisma.account.findMany({
            where
        });
        for (const account of accounts){
            const movements = await this.prisma.accountMovement.findMany({
                where: {
                    accountId: account.id,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                orderBy: [
                    {
                        date: 'asc'
                    },
                    {
                        createdAt: 'asc'
                    }
                ]
            });
            let runningBalance = 0;
            for (const movement of movements){
                if (movement.type === 'DEBIT') {
                    runningBalance += Number(movement.amount);
                } else {
                    runningBalance -= Number(movement.amount);
                }
                await this.prisma.accountMovement.update({
                    where: {
                        id: movement.id
                    },
                    data: {
                        balance: runningBalance
                    }
                });
            }
            await this.prisma.account.update({
                where: {
                    id: account.id
                },
                data: {
                    balance: runningBalance
                }
            });
        }
        return {
            success: true,
            count: accounts.length
        };
    }
    async getVadeAnaliz(accountId) {
        const analysisData = await this.getDueDateAnalysis(accountId);
        return {
            ozet: {
                toplam: analysisData.summary.total,
                toplamTutar: analysisData.summary.totalAmount,
                toplamKalanTutar: analysisData.summary.totalPayableAmount,
                vadesiGecenler: {
                    adet: analysisData.summary.pastDue.count,
                    tutar: analysisData.summary.pastDue.amount
                },
                bugunVadenler: {
                    adet: analysisData.summary.dueToday.count,
                    tutar: analysisData.summary.dueToday.amount
                },
                yaklaşanlar: {
                    adet: analysisData.summary.upcoming.count,
                    tutar: analysisData.summary.upcoming.amount
                },
                normalFaturalar: {
                    adet: analysisData.summary.normalInvoices.count,
                    tutar: analysisData.summary.normalInvoices.amount
                }
            },
            cariOzet: analysisData.accountSummary ? analysisData.accountSummary.map((acc)=>({
                    cari: {
                        id: acc.account.id,
                        cariKodu: acc.account.code,
                        unvan: acc.account.title,
                        tip: acc.account.type
                    },
                    toplamFatura: acc.totalInvoices,
                    toplamKalan: acc.totalRemaining,
                    vadesiGecen: acc.pastDueCount,
                    vadesiGecenTutar: acc.pastDueAmount
                })) : null,
            faturalar: analysisData.invoices.map((inv)=>({
                    id: inv.id,
                    faturaNo: inv.invoiceNo,
                    faturaTipi: inv.invoiceType,
                    cari: {
                        id: inv.account.id,
                        cariKodu: inv.account.code,
                        unvan: inv.account.title,
                        tip: inv.account.type
                    },
                    tarih: inv.date,
                    vade: inv.dueDate,
                    genelToplam: inv.grandTotal,
                    odenenTutar: inv.paidAmount,
                    odenecekTutar: inv.payableAmount,
                    kalanGun: inv.daysRemaining,
                    vadeDurumu: inv.dueDateStatus === 'PAST' ? 'GECMIS' : inv.dueDateStatus === 'TODAY' ? 'BUGUN' : inv.dueDateStatus === 'UPCOMING' ? 'YAKLASAN' : 'NORMAL',
                    gecenGun: inv.daysPassed
                }))
        };
    }
    constructor(prisma, tenantResolver, codeTemplateService, salesWaybillService, invoiceProfitService, costingService, systemParameterService, warehouseService, deletionProtection, tcmbService, accountBalanceService, orchestratorService, stockEffectService, accountEffectService, unitSetService, statusCalculator){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.codeTemplateService = codeTemplateService;
        this.salesWaybillService = salesWaybillService;
        this.invoiceProfitService = invoiceProfitService;
        this.costingService = costingService;
        this.systemParameterService = systemParameterService;
        this.warehouseService = warehouseService;
        this.deletionProtection = deletionProtection;
        this.tcmbService = tcmbService;
        this.accountBalanceService = accountBalanceService;
        this.orchestratorService = orchestratorService;
        this.stockEffectService = stockEffectService;
        this.accountEffectService = accountEffectService;
        this.unitSetService = unitSetService;
        this.statusCalculator = statusCalculator;
    }
};
InvoiceService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(3, (0, _common.Inject)((0, _common.forwardRef)(()=>_saleswaybillservice.SalesWaybillService))),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService,
        typeof _saleswaybillservice.SalesWaybillService === "undefined" ? Object : _saleswaybillservice.SalesWaybillService,
        typeof _invoiceprofitservice.InvoiceProfitService === "undefined" ? Object : _invoiceprofitservice.InvoiceProfitService,
        typeof _costingservice.CostingService === "undefined" ? Object : _costingservice.CostingService,
        typeof _systemparameterservice.SystemParameterService === "undefined" ? Object : _systemparameterservice.SystemParameterService,
        typeof _warehouseservice.WarehouseService === "undefined" ? Object : _warehouseservice.WarehouseService,
        typeof _deletionprotectionservice.DeletionProtectionService === "undefined" ? Object : _deletionprotectionservice.DeletionProtectionService,
        typeof _tcmbservice.TcmbService === "undefined" ? Object : _tcmbservice.TcmbService,
        typeof _accountbalanceservice.AccountBalanceService === "undefined" ? Object : _accountbalanceservice.AccountBalanceService,
        typeof _invoiceorchestratorservice.InvoiceOrchestratorService === "undefined" ? Object : _invoiceorchestratorservice.InvoiceOrchestratorService,
        typeof _stockeffectservice.StockEffectService === "undefined" ? Object : _stockeffectservice.StockEffectService,
        typeof _accounteffectservice.AccountEffectService === "undefined" ? Object : _accounteffectservice.AccountEffectService,
        typeof _unitsetservice.UnitSetService === "undefined" ? Object : _unitsetservice.UnitSetService,
        typeof _statuscalculatorservice.StatusCalculatorService === "undefined" ? Object : _statuscalculatorservice.StatusCalculatorService
    ])
], InvoiceService);

//# sourceMappingURL=invoice.service.js.map