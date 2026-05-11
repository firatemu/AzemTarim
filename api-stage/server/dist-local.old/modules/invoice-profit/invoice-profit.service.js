"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoiceProfitService", {
    enumerable: true,
    get: function() {
        return InvoiceProfitService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _library = require("@prisma/client/runtime/library");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let InvoiceProfitService = class InvoiceProfitService {
    /**
   * Ürünün güncel maliyetini StockCostHistory'den al
   * @param productId Stok ID
   * @param tenantId Tenant ID (opsiyonel, tenant kontrolü için)
   * @param prisma Prisma client instance (opsiyonel, transaction için)
   */ async getCurrentCost(productId, tenantId, prisma) {
        const db = prisma || this.prisma;
        const currentTenantId = tenantId ?? await this.tenantResolver.resolveForQuery();
        // Check tenant through product
        const product = await db.product.findUnique({
            where: {
                id: productId
            },
            select: {
                tenantId: true
            }
        });
        if (!product) {
            console.warn(`Product not found: ${productId}`);
            return 0;
        }
        // Tenant check: If tenantId exists and product's tenantId is different, return 0
        if (currentTenantId && product.tenantId && product.tenantId !== currentTenantId) {
            console.warn(`Product tenantId (${product.tenantId}) doesn't match current tenantId (${currentTenantId}): ${productId}`);
            return 0;
        }
        const latestCost = await db.productCostHistory.findFirst({
            where: {
                productId: productId
            },
            orderBy: {
                computedAt: 'desc'
            },
            select: {
                cost: true
            }
        });
        return latestCost ? Number(latestCost.cost) : 0;
    }
    /**
   * Invoice için kar hesapla ve kaydet
   * @param invoiceId Invoice ID
   * @param userId User ID (opsiyonel)
   * @param prisma Prisma client instance (opsiyonel, transaction için)
   */ async calculateAndSaveProfit(invoiceId, userId, prisma) {
        const db = prisma || this.prisma;
        const tenantId = await this.tenantResolver.resolveForQuery();
        try {
            // Get invoice with items
            const invoice = await db.invoice.findUnique({
                where: {
                    id: invoiceId
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    tenantId: true
                                }
                            }
                        }
                    }
                }
            });
            if (!invoice) {
                throw new _common.NotFoundException(`Invoice not found: ${invoiceId}`);
            }
            // Calculate profit for SALES invoices only
            if (invoice.invoiceType !== 'SALE') {
                console.log(`Invoice ${invoiceId} is not SALE type (${invoice.invoiceType}), profit calculation skipped`);
                return;
            }
            // No items, skip profit calculation
            if (!invoice.items || invoice.items.length === 0) {
                console.warn(`No items found for invoice ${invoiceId}, profit calculation skipped`);
                return;
            }
            // Delete existing profit records (for recalculation)
            const existingCount = await db.invoiceProfit.count({
                where: {
                    invoiceId: invoiceId
                }
            });
            if (existingCount > 0) {
                console.log(`Deleting ${existingCount} existing profit records for invoice ${invoiceId}...`);
                const deleteResult = await db.invoiceProfit.deleteMany({
                    where: {
                        invoiceId: invoiceId
                    }
                });
                console.log(`Deleted ${deleteResult.count} profit records for invoice ${invoiceId}`);
                // Re-check after deletion
                const remainingCount = await db.invoiceProfit.count({
                    where: {
                        invoiceId: invoiceId
                    }
                });
                if (remainingCount > 0) {
                    console.warn(`${remainingCount} records still exist for invoice ${invoiceId}, retrying delete...`);
                    await db.invoiceProfit.deleteMany({
                        where: {
                            invoiceId: invoiceId
                        }
                    });
                }
            }
            let totalSalesAmount = new _library.Decimal(0);
            let totalCost = new _library.Decimal(0);
            const profitRecords = [];
            const seenItemIds = new Set(); // For duplicate item check
            // Calculate profit for each item
            for (const item of invoice.items){
                // Duplicate item check - avoid multiple records for same item.id
                if (seenItemIds.has(item.id)) {
                    console.warn(`Duplicate item found for invoice ${invoiceId} (item.id: ${item.id}), skipped`);
                    continue;
                }
                seenItemIds.add(item.id);
                // Skip if productId is missing
                if (!item.productId) {
                    console.warn(`productId not found for invoice ${invoiceId} item ${item.id}, skipped`);
                    continue;
                }
                // Product tenant check
                const productTenantId = item.product?.tenantId;
                if (tenantId && productTenantId && productTenantId !== tenantId) {
                    console.warn(`Product tenantId (${productTenantId}) doesn't match current tenantId (${tenantId}) for invoice ${invoiceId} item ${item.id}, skipped`);
                    continue;
                }
                const quantity = item.quantity;
                const netAmount = Number(item.amount || 0);
                const vatAmount = Number(item.vatAmount || 0);
                const totalSalesVatIncluded = netAmount + vatAmount; // Sales amount including VAT
                const unitPriceVatIncluded = quantity > 0 ? totalSalesVatIncluded / quantity : 0;
                const unitCost = await this.getCurrentCost(item.productId, tenantId, db);
                const totalSales = new _library.Decimal(totalSalesVatIncluded);
                const totalCostItem = new _library.Decimal(unitCost * quantity);
                const profit = totalSales.minus(totalCostItem);
                const profitRate = totalCostItem.gt(0) ? profit.dividedBy(totalCostItem).times(100) : new _library.Decimal(0);
                totalSalesAmount = totalSalesAmount.plus(totalSales);
                totalCost = totalCost.plus(totalCostItem);
                // Item-based profit record (based on price including VAT)
                profitRecords.push({
                    invoiceId: invoiceId,
                    invoiceItemId: item.id,
                    productId: item.productId,
                    tenantId: tenantId || null,
                    quantity: quantity,
                    unitPrice: new _library.Decimal(unitPriceVatIncluded),
                    unitCost: new _library.Decimal(unitCost),
                    totalSalesAmount: totalSales,
                    totalCost: totalCostItem,
                    profit: profit,
                    profitRate: profitRate
                });
            }
            // Invoice-based total profit record (invoiceItemId = null)
            const totalProfit = totalSalesAmount.minus(totalCost);
            const totalProfitRate = totalCost.gt(0) ? totalProfit.dividedBy(totalCost).times(100) : new _library.Decimal(0);
            // Get first item productId (as reference for total record)
            const firstItemProductId = invoice.items.find((k)=>k.productId)?.productId;
            if (!firstItemProductId) {
                console.warn(`No valid productId found for invoice ${invoiceId}, total record not created`);
                // Save item-based records if they exist
                if (profitRecords.length > 0) {
                    await db.invoiceProfit.createMany({
                        data: profitRecords
                    });
                }
                return;
            }
            profitRecords.push({
                invoiceId: invoiceId,
                invoiceItemId: null,
                productId: firstItemProductId,
                tenantId: tenantId || null,
                quantity: invoice.items.reduce((sum, k)=>sum + k.quantity, 0),
                unitPrice: new _library.Decimal(0),
                unitCost: new _library.Decimal(0),
                totalSalesAmount: totalSalesAmount,
                totalCost: totalCost,
                profit: totalProfit,
                profitRate: totalProfitRate
            });
            // Create all records (if any)
            if (profitRecords.length > 0) {
                // Duplicate check - based on invoiceItemId
                const uniqueRecords = new Map();
                for (const record of profitRecords){
                    const key = record.invoiceItemId || 'total';
                    if (!uniqueRecords.has(key)) {
                        uniqueRecords.set(key, record);
                    } else {
                        console.warn(`Duplicate profit record found for invoice ${invoiceId} (invoiceItemId: ${record.invoiceItemId}), skipped`);
                    }
                }
                const finalRecords = Array.from(uniqueRecords.values());
                await db.invoiceProfit.createMany({
                    data: finalRecords
                });
                console.log(`Created ${finalRecords.length} profit records for invoice ${invoiceId}`);
            } else {
                console.warn(`Could not create profit record for invoice ${invoiceId} (no items or invalid)`);
            }
        } catch (error) {
            console.error(`Error calculating profit for invoice ${invoiceId}:`, error?.message || error, error?.stack);
            throw error;
        }
    }
    /**
   * Recalculate invoice profit (in draft status)
   */ async recalculateProfit(invoiceId, userId) {
        await this.calculateAndSaveProfit(invoiceId, userId);
    }
    /**
   * Invoice bazlı kar bilgisi
   */ async getProfitByInvoice(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: {
                id: invoiceId
            },
            include: {
                account: {
                    select: {
                        id: true,
                        code: true,
                        title: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                code: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
        if (!invoice) {
            throw new _common.NotFoundException(`Invoice not found: ${invoiceId}`);
        }
        // Invoice total profit record (invoiceItemId = null)
        const totalProfitRecord = await this.prisma.invoiceProfit.findFirst({
            where: {
                invoiceId: invoiceId,
                invoiceItemId: null
            }
        });
        // Item-based profit records
        const itemProfitRecords = await this.prisma.invoiceProfit.findMany({
            where: {
                invoiceId: invoiceId,
                invoiceItemId: {
                    not: null
                }
            },
            include: {
                invoiceItem: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                code: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                computedAt: 'asc'
            }
        });
        return {
            fatura: {
                id: invoice.id,
                faturaNo: invoice.invoiceNo,
                tarih: invoice.date,
                cari: {
                    id: invoice.account.id,
                    cariKodu: invoice.account.code,
                    unvan: invoice.account.title
                },
                toplamSatisTutari: totalProfitRecord ? Number(totalProfitRecord.totalSalesAmount) : 0,
                toplamMaliyet: totalProfitRecord ? Number(totalProfitRecord.totalCost) : 0,
                toplamKar: totalProfitRecord ? Number(totalProfitRecord.profit) : 0,
                karOrani: totalProfitRecord ? Number(totalProfitRecord.profitRate) : 0
            },
            kalemler: itemProfitRecords.map((record)=>({
                    id: record.id,
                    faturaKalemiId: record.invoiceItemId,
                    stok: record.invoiceItem?.product ? {
                        id: record.invoiceItem.product.id,
                        stokKodu: record.invoiceItem.product.code,
                        stokAdi: record.invoiceItem.product.name
                    } : null,
                    miktar: record.quantity,
                    birimFiyat: Number(record.unitPrice),
                    birimMaliyet: Number(record.unitCost),
                    toplamSatisTutari: Number(record.totalSalesAmount),
                    toplamMaliyet: Number(record.totalCost),
                    kar: Number(record.profit),
                    karOrani: Number(record.profitRate)
                }))
        };
    }
    /**
   * Ürün bazlı kar bilgisi
   */ async getProfitByProduct(filters) {
        const tenantId = filters?.tenantId ?? await this.tenantResolver.resolveForQuery();
        const where = {
            invoiceItemId: {
                not: null
            },
            ...filters?.productId && {
                productId: filters.productId
            },
            ...filters?.startDate || filters?.endDate ? {
                invoice: {
                    date: {
                        ...filters?.startDate && {
                            gte: filters.startDate
                        },
                        ...filters?.endDate && {
                            lte: filters.endDate
                        }
                    }
                }
            } : {}
        };
        // TenantId varsa filtre ekle, yoksa ekleme (null tenantId'li kayıtlar da dahil)
        if (tenantId) {
            where.tenantId = tenantId;
        }
        let profitRecords = await this.prisma.invoiceProfit.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                },
                invoice: {
                    select: {
                        id: true,
                        invoiceNo: true,
                        date: true,
                        account: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                invoice: {
                    date: 'desc'
                }
            }
        });
        // If no profit records found, calculate automatically for SALE invoices
        if (profitRecords.length === 0) {
            console.log('[getProfitByProduct] No profit records found, starting automatic calculation for SALE invoices...');
            // Find SALE invoices
            const invoiceWhere = {
                invoiceType: 'SALE',
                ...filters?.startDate || filters?.endDate ? {
                    date: {
                        ...filters?.startDate && {
                            gte: filters.startDate
                        },
                        ...filters?.endDate && {
                            lte: filters.endDate
                        }
                    }
                } : {}
            };
            // TenantId varsa filtre ekle
            if (tenantId) {
                invoiceWhere.tenantId = tenantId;
            }
            const invoices = await this.prisma.invoice.findMany({
                where: invoiceWhere,
                select: {
                    id: true
                },
                take: 100
            });
            console.log(`[getProfitByProduct] Calculating profit for ${invoices.length} invoices...`);
            // Bulk calculate profit
            await Promise.allSettled(invoices.map((invoice)=>this.calculateAndSaveProfit(invoice.id).catch((err)=>{
                    console.error(`[getProfitByProduct] Profit calculation error (invoice ${invoice.id}):`, err);
                })));
            // Yeniden sorgula
            profitRecords = await this.prisma.invoiceProfit.findMany({
                where,
                include: {
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    },
                    invoice: {
                        select: {
                            id: true,
                            invoiceNo: true,
                            date: true,
                            account: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    invoice: {
                        date: 'desc'
                    }
                }
            });
            console.log(`[getProfitByProduct] ${profitRecords.length} profit records found`);
        }
        // Product-based totals
        const productMap = new Map();
        for (const record of profitRecords){
            // Skip if product is null
            if (!record.product) {
                continue;
            }
            const productId = record.productId;
            if (!productMap.has(productId)) {
                productMap.set(productId, {
                    product: record.product,
                    totalQuantity: 0,
                    totalSalesAmount: 0,
                    totalCost: 0,
                    totalProfit: 0,
                    invoices: []
                });
            }
            const productEntry = productMap.get(productId);
            productEntry.totalQuantity += record.quantity;
            productEntry.totalSalesAmount += Number(record.totalSalesAmount);
            productEntry.totalCost += Number(record.totalCost);
            productEntry.totalProfit += Number(record.profit);
            productEntry.invoices.push({
                invoiceId: record.invoiceId,
                invoiceNo: record.invoice.invoiceNo,
                date: record.invoice.date,
                account: record.invoice.account,
                quantity: record.quantity,
                salesAmount: Number(record.totalSalesAmount),
                cost: Number(record.totalCost),
                profit: Number(record.profit)
            });
        }
        // Convert Map to array and calculate profit rate
        const result = Array.from(productMap.values()).map((product)=>({
                stok: {
                    id: product.product.id,
                    stokKodu: product.product.code,
                    stokAdi: product.product.name
                },
                toplamMiktar: product.totalQuantity,
                toplamSatisTutari: product.totalSalesAmount,
                toplamMaliyet: product.totalCost,
                toplamKar: product.totalProfit,
                karOrani: product.totalCost > 0 ? product.totalProfit / product.totalCost * 100 : 0,
                faturalar: product.invoices.map((inv)=>({
                        faturaId: inv.invoiceId,
                        faturaNo: inv.invoiceNo,
                        tarih: inv.date,
                        cari: {
                            id: inv.account.id,
                            unvan: inv.account.title
                        },
                        miktar: inv.quantity,
                        satisTutari: inv.salesAmount,
                        maliyet: inv.cost,
                        kar: inv.profit
                    }))
            }));
        return result;
    }
    /**
   * Invoice bazlı karlılık listesi (master-detail için)
   */ async getProfitList(filters) {
        const tenantId = filters?.tenantId ?? await this.tenantResolver.resolveForQuery();
        const where = {
            invoiceType: 'SALE',
            ...filters?.accountId && {
                accountId: filters.accountId
            },
            ...filters?.status && {
                status: filters.status
            },
            ...filters?.startDate || filters?.endDate ? {
                date: {
                    ...filters?.startDate && {
                        gte: filters.startDate
                    },
                    ...filters?.endDate && {
                        lte: filters.endDate
                    }
                }
            } : {}
        };
        // TenantId varsa filtre ekle, yoksa ekleme (null tenantId'li faturalar da dahil)
        if (tenantId) {
            where.tenantId = tenantId;
        }
        const invoices = await this.prisma.invoice.findMany({
            where,
            include: {
                account: {
                    select: {
                        id: true,
                        code: true,
                        title: true
                    }
                }
            },
            orderBy: [
                {
                    date: 'desc'
                },
                {
                    createdAt: 'desc'
                }
            ]
        });
        // Get total profit record for each invoice with separate query
        const invoiceIds = invoices.map((f)=>f.id);
        // TenantId null ise filtre eklemeyelim, varsa filtreleyelim
        const profitWhere = {
            invoiceId: {
                in: invoiceIds
            },
            invoiceItemId: null
        };
        // TenantId varsa filtre ekle, yoksa ekleme (null tenantId'li kayıtlar da dahil)
        if (tenantId) {
            profitWhere.tenantId = tenantId;
        }
        const totalProfitRecords = await this.prisma.invoiceProfit.findMany({
            where: profitWhere
        });
        const profitMap = new Map(totalProfitRecords.map((k)=>[
                k.invoiceId,
                k
            ]));
        // Calculate profit automatically for invoices without profit record
        const invoicesWithoutProfit = invoices.filter((f)=>!profitMap.has(f.id));
        // Bulk calculate profit (async, continue silently on error)
        if (invoicesWithoutProfit.length > 0) {
            console.log(`[getProfitList] Calculating profit for ${invoicesWithoutProfit.length} invoices...`);
            await Promise.allSettled(invoicesWithoutProfit.map((invoice)=>this.calculateAndSaveProfit(invoice.id).catch((err)=>{
                    console.error(`[getProfitList] Profit calculation error (invoice ${invoice.id}):`, err);
                })));
            // Re-query (with tenantId check)
            const newProfitWhere = {
                invoiceId: {
                    in: invoiceIds
                },
                invoiceItemId: null
            };
            if (tenantId) {
                newProfitWhere.tenantId = tenantId;
            }
            const newTotalProfitRecords = await this.prisma.invoiceProfit.findMany({
                where: newProfitWhere
            });
            newTotalProfitRecords.forEach((k)=>{
                profitMap.set(k.invoiceId, k);
            });
            console.log(`[getProfitList] ${newTotalProfitRecords.length} profit records found`);
        }
        return invoices.map((invoice)=>{
            const totalProfit = profitMap.get(invoice.id);
            return {
                fatura: {
                    id: invoice.id,
                    faturaNo: invoice.invoiceNo,
                    tarih: invoice.date,
                    cari: {
                        id: invoice.account.id,
                        cariKodu: invoice.account.code,
                        unvan: invoice.account.title
                    },
                    durum: invoice.status
                },
                toplamSatisTutari: totalProfit ? Number(totalProfit.totalSalesAmount) : Number(invoice.grandTotal || 0),
                toplamMaliyet: totalProfit ? Number(totalProfit.totalCost) : 0,
                toplamKar: totalProfit ? Number(totalProfit.profit) : 0,
                karOrani: totalProfit ? Number(totalProfit.profitRate) : 0
            };
        });
    }
    async getProfitDetailByInvoice(invoiceId) {
        // First check profit records
        let itemProfitRecords = await this.prisma.invoiceProfit.findMany({
            where: {
                invoiceId: invoiceId,
                invoiceItemId: {
                    not: null
                }
            },
            include: {
                invoiceItem: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                code: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                computedAt: 'desc'
            }
        });
        // If no profit records found, calculate automatically
        const hasValidRecords = itemProfitRecords.some((k)=>k.invoiceItemId !== null && k.invoiceItem !== null);
        if (!hasValidRecords) {
            try {
                console.log(`[getProfitDetailByInvoice] No valid profit record for invoice ${invoiceId}, starting automatic calculation...`);
                await this.calculateAndSaveProfit(invoiceId);
                // Re-query
                itemProfitRecords = await this.prisma.invoiceProfit.findMany({
                    where: {
                        invoiceId: invoiceId,
                        invoiceItemId: {
                            not: null
                        }
                    },
                    include: {
                        invoiceItem: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        code: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        computedAt: 'desc'
                    }
                });
                console.log(`[getProfitDetailByInvoice] Found ${itemProfitRecords.length} profit records for invoice ${invoiceId}`);
            } catch (error) {
                console.error(`Profit calculation error (invoice ${invoiceId}):`, error);
                // Return empty array on error
                return [];
            }
        }
        // Filter duplicate records - each invoiceItemId should have only one record
        // If duplicates exist, take the latest one (for safety)
        const uniqueItemMap = new Map();
        for (const record of itemProfitRecords){
            // Skip null invoiceItemId (total records)
            if (!record.invoiceItemId) {
                continue;
            }
            // If no record for this invoiceItemId or existing is older, update
            const existing = uniqueItemMap.get(record.invoiceItemId);
            if (!existing || record.computedAt > existing.computedAt) {
                uniqueItemMap.set(record.invoiceItemId, record);
            } else if (existing && record.computedAt <= existing.computedAt) {
                // Duplicate record found
                console.warn(`[getProfitDetailByInvoice] Duplicate record found (invoiceItemId: ${record.invoiceItemId}, id: ${record.id}), skipped`);
            }
        }
        // Convert from Map to array and filter null invoiceItem
        return Array.from(uniqueItemMap.values()).filter((record)=>record.invoiceItem !== null).sort((a, b)=>{
            // Sort by calculation date (older records first)
            return a.computedAt.getTime() - b.computedAt.getTime();
        }).map((record)=>({
                id: record.id,
                stok: record.invoiceItem?.product ? {
                    id: record.invoiceItem.product.id,
                    stokKodu: record.invoiceItem.product.code,
                    stokAdi: record.invoiceItem.product.name
                } : null,
                miktar: record.quantity,
                birimFiyat: Number(record.unitPrice),
                birimMaliyet: Number(record.unitCost),
                toplamSatisTutari: Number(record.totalSalesAmount),
                toplamMaliyet: Number(record.totalCost),
                kar: Number(record.profit),
                karOrani: Number(record.profitRate)
            }));
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
InvoiceProfitService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], InvoiceProfitService);

//# sourceMappingURL=invoice-profit.service.js.map