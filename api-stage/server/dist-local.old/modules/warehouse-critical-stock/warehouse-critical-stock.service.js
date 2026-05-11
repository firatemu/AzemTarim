"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WarehouseCriticalStockService", {
    enumerable: true,
    get: function() {
        return WarehouseCriticalStockService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let WarehouseCriticalStockService = class WarehouseCriticalStockService {
    async bulkCreateForProduct(productId, criticalQty) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // Get all active warehouses
        const warehouses = await this.prisma.warehouse.findMany({
            where: {
                active: true,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        // Create critical stock records for all warehouses
        const createPromises = warehouses.map((warehouse)=>this.prisma.warehouseCriticalStock.upsert({
                where: {
                    warehouseId_productId: {
                        warehouseId: warehouse.id,
                        productId
                    }
                },
                create: {
                    warehouseId: warehouse.id,
                    productId,
                    criticalQty
                },
                update: {
                    criticalQty
                }
            }));
        return Promise.all(createPromises);
    }
    async updateCriticalStock(warehouseId, productId, criticalQty) {
        return this.prisma.warehouseCriticalStock.upsert({
            where: {
                warehouseId_productId: {
                    warehouseId,
                    productId
                }
            },
            create: {
                warehouseId,
                productId,
                criticalQty
            },
            update: {
                criticalQty
            }
        });
    }
    async getCriticalStockReport() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // 1. Get all active warehouses
        const warehouses = await this.prisma.warehouse.findMany({
            where: {
                active: true,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            select: {
                id: true,
                name: true,
                code: true
            }
        });
        // 2. Get all products with their current stock levels
        const currentStocks = await this.prisma.productLocationStock.findMany({
            where: {
                warehouse: {
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            },
            include: {
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        unit: true,
                        brand: true
                    }
                }
            }
        });
        // 3. Get all critical stock settings
        const criticalStocks = await this.prisma.warehouseCriticalStock.findMany({
            where: {
                warehouse: {
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            }
        });
        // 4. Build product matrix
        const productMatrix = {};
        // Initialize with current stocks
        currentStocks.forEach((stock)=>{
            const pId = stock.productId;
            if (!productMatrix[pId]) {
                productMatrix[pId] = {
                    productId: pId,
                    code: stock.product.code,
                    name: stock.product.name,
                    birim: stock.product.unit,
                    marka: stock.product.brand,
                    warehouses: {},
                    overallStatus: 'NORMAL'
                };
                // Initialize all warehouses
                warehouses.forEach((w)=>{
                    productMatrix[pId].warehouses[w.id] = {
                        currentStock: 0,
                        criticalStock: 0,
                        status: 'NORMAL'
                    };
                });
            }
            productMatrix[pId].warehouses[stock.warehouseId].currentStock += stock.qtyOnHand;
        });
        // Apply critical stock thresholds
        criticalStocks.forEach((cs)=>{
            if (productMatrix[cs.productId]) {
                productMatrix[cs.productId].warehouses[cs.warehouseId].criticalStock = cs.criticalQty;
            }
        });
        // Calculate statuses
        Object.values(productMatrix).forEach((product)=>{
            let hasCritical = false;
            let hasEqual = false;
            Object.values(product.warehouses).forEach((wh)=>{
                if (wh.currentStock < wh.criticalStock) {
                    wh.status = 'BELOW';
                    hasCritical = true;
                } else if (wh.currentStock === wh.criticalStock) {
                    wh.status = 'EQUAL';
                    hasEqual = true;
                } else {
                    wh.status = 'ABOVE';
                }
            });
            if (hasCritical) {
                product.overallStatus = 'CRITICAL';
            } else if (hasEqual) {
                product.overallStatus = 'WARNING';
            } else {
                product.overallStatus = 'NORMAL';
            }
        });
        return {
            warehouses,
            report: Object.values(productMatrix)
        };
    }
    async bulkUpdateFromExcel(data) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const tenantWhere = (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined);
        // 1. Get all active warehouses to map codes to IDs
        const warehouses = await this.prisma.warehouse.findMany({
            where: {
                active: true,
                ...tenantWhere
            },
            select: {
                id: true,
                code: true
            }
        });
        // Create a map for exact matches and a normalized map (numeric -> id)
        const warehouseMap = new Map();
        const warehouseNumericMap = new Map();
        warehouses.forEach((w)=>{
            const code = w.code.trim().toUpperCase();
            warehouseMap.set(code, w.id);
            // If code is numeric (e.g., "01"), store its integer representation as a string ("1")
            const numericValue = parseInt(code, 10);
            if (!isNaN(numericValue)) {
                warehouseNumericMap.set(numericValue.toString(), w.id);
            }
        });
        // 2. Get all involved products to map codes to IDs
        const rawStokKodlari = data.map((d)=>d.code?.toString().trim().toUpperCase()).filter(Boolean);
        const stokKodlari = [
            ...new Set(rawStokKodlari)
        ];
        // Find products exactly matching provided codes
        const products = await this.prisma.product.findMany({
            where: {
                code: {
                    in: stokKodlari
                },
                ...tenantWhere
            },
            select: {
                id: true,
                code: true
            }
        });
        const productMap = new Map(products.map((p)=>[
                p.code.trim().toUpperCase(),
                p.id
            ]));
        // 3. Process updates
        const results = {
            updated: 0,
            skipped: 0,
            errors: []
        };
        const updatePromises = data.map(async (row)=>{
            const wCodeRaw = row.ambarKodu?.toString().trim().toUpperCase();
            const pCodeRaw = row.code?.toString().trim().toUpperCase();
            if (!wCodeRaw || !pCodeRaw) {
                results.skipped++;
                results.errors.push(`Geçersiz satır: Ambar=${wCodeRaw || 'Boş'}, Stok=${pCodeRaw || 'Boş'}`);
                return;
            }
            // Warehouse matching: try exact then normalized numeric
            let wId = warehouseMap.get(wCodeRaw);
            if (!wId) {
                const numericCode = parseInt(wCodeRaw, 10);
                if (!isNaN(numericCode)) {
                    wId = warehouseNumericMap.get(numericCode.toString());
                }
            }
            // Product matching: exact match
            const pId = productMap.get(pCodeRaw);
            if (!wId || !pId) {
                results.skipped++;
                if (!wId) results.errors.push(`Warehouse code not found: wCodeRaw`);
                if (!pId) results.errors.push(`Stock code not found: pCodeRaw`);
                return;
            }
            try {
                await this.prisma.warehouseCriticalStock.upsert({
                    where: {
                        warehouseId_productId: {
                            warehouseId: wId,
                            productId: pId
                        }
                    },
                    create: {
                        warehouseId: wId,
                        productId: pId,
                        criticalQty: Number(row.criticalQty)
                    },
                    update: {
                        criticalQty: Number(row.criticalQty)
                    }
                });
                results.updated++;
            } catch (error) {
                results.errors.push(`${pCodeRaw} @ ${wCodeRaw} güncellenirken hata: ${error.message}`);
            }
        });
        await Promise.all(updatePromises);
        return results;
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
WarehouseCriticalStockService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], WarehouseCriticalStockService);

//# sourceMappingURL=warehouse-critical-stock.service.js.map