"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WarehouseService", {
    enumerable: true,
    get: function() {
        return WarehouseService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _codetemplateservice = require("../code-template/code-template.service");
const _codetemplateenums = require("../code-template/code-template.enums");
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
let WarehouseService = class WarehouseService {
    async findAll(active) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (active !== undefined) where.active = active;
        return this.prisma.warehouse.findMany({
            where,
            include: {
                _count: {
                    select: {
                        locations: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                locations: {
                    where: {
                        active: true
                    },
                    orderBy: {
                        code: 'asc'
                    }
                },
                _count: {
                    select: {
                        locations: true,
                        productLocationStocks: true
                    }
                }
            }
        });
        if (!warehouse) {
            throw new _common.NotFoundException('Warehouse not found');
        }
        return warehouse;
    }
    async findByCode(code) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                code,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                locations: {
                    where: {
                        active: true
                    },
                    orderBy: {
                        code: 'asc'
                    }
                }
            }
        });
        if (!warehouse) {
            throw new _common.NotFoundException('Warehouse not found');
        }
        return warehouse;
    }
    async create(createDto) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            allowNull: true
        });
        let code = createDto.code;
        if (!code || code.trim() === '') {
            try {
                code = await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.WAREHOUSE);
            } catch (error) {
                throw new _common.BadRequestException('Automatic code generation failed. Please enter a manual code or check the "Number Templates" settings.');
            }
        }
        const existing = await this.prisma.warehouse.findFirst({
            where: {
                code,
                ...tenantId != null ? {
                    tenantId
                } : {
                    tenantId: null
                }
            }
        });
        if (existing) {
            throw new _common.BadRequestException('This warehouse code is already in use');
        }
        const created = await this.prisma.warehouse.create({
            data: {
                code,
                ...tenantId != null && {
                    tenantId
                },
                name: createDto.name,
                active: createDto.active ?? true,
                isDefault: createDto.isDefault ?? false,
                address: createDto.address,
                phone: createDto.phone,
                manager: createDto.manager
            }
        });
        if (createDto.isDefault) {
            await this.setOtherWarehousesNotDefault(created.id, tenantId ?? undefined);
        }
        // Update code template counter
        await this.codeTemplateService.saveLastCode(_codetemplateenums.ModuleType.WAREHOUSE, created.code);
        return created;
    }
    async setOtherWarehousesNotDefault(currentId, tenantId) {
        await this.prisma.warehouse.updateMany({
            where: {
                id: {
                    not: currentId
                },
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId)
            },
            data: {
                isDefault: false
            }
        });
    }
    async update(id, updateDto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id,
                ...tenantId != null ? {
                    tenantId
                } : {
                    tenantId: null
                }
            }
        });
        if (!warehouse) {
            throw new _common.NotFoundException('Warehouse not found');
        }
        if (updateDto.code && updateDto.code !== warehouse.code) {
            const existing = await this.prisma.warehouse.findFirst({
                where: {
                    code: updateDto.code,
                    ...tenantId != null ? {
                        tenantId
                    } : {
                        tenantId: null
                    }
                }
            });
            if (existing) {
                throw new _common.BadRequestException('This warehouse code is already in use');
            }
        }
        const updated = await this.prisma.warehouse.update({
            where: {
                id
            },
            data: updateDto
        });
        if (updateDto.isDefault) {
            await this.setOtherWarehousesNotDefault(id, tenantId ?? undefined);
        }
        return updated;
    }
    async remove(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id,
                ...tenantId != null ? {
                    tenantId
                } : {
                    tenantId: null
                }
            },
            include: {
                _count: {
                    select: {
                        locations: true,
                        productLocationStocks: true
                    }
                }
            }
        });
        if (!warehouse) {
            throw new _common.NotFoundException('Warehouse not found');
        }
        if (warehouse._count?.locations && warehouse._count.locations > 0) {
            throw new _common.BadRequestException('There are shelves in this warehouse. Please delete the shelves first.');
        }
        if (warehouse._count?.productLocationStocks && warehouse._count.productLocationStocks > 0) {
            throw new _common.BadRequestException('There are product records in this warehouse. Please clear the product records first.');
        }
        return this.prisma.warehouse.delete({
            where: {
                id
            }
        });
    }
    async getStockReport(warehouseId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const stocks = await this.prisma.productLocationStock.findMany({
            where: {
                warehouseId,
                warehouse: {
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            },
            include: {
                product: true,
                location: true
            }
        });
        const productGroups = stocks.reduce((acc, current)=>{
            const productId = current.productId;
            if (!acc[productId]) {
                acc[productId] = {
                    id: productId,
                    code: current.product.code,
                    name: current.product.name,
                    birim: current.product.unit,
                    qtyOnHand: 0,
                    qtyReserved: 0,
                    qtyAvailable: 0,
                    locations: []
                };
            }
            acc[productId].qtyOnHand += current.qtyOnHand;
            acc[productId].qtyAvailable = acc[productId].qtyOnHand - acc[productId].qtyReserved;
            acc[productId].locations.push({
                locationCode: current.location.code,
                locationName: current.location.name,
                quantity: current.qtyOnHand
            });
            return acc;
        }, {});
        return Object.values(productGroups);
    }
    async getOrCreateDefaultLocation(warehouseId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // Verify warehouse exists and belongs to tenant
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id: warehouseId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!warehouse) {
            throw new _common.NotFoundException('Warehouse not found');
        }
        // Generate clean code using warehouse code
        // Fallback to ID if code is missing (should not happen due to schema)
        const warehouseCode = warehouse.code || 'MAIN';
        const locCode = `GENEL-${warehouseCode}`;
        const locName = `Genel Depo Alanı (${warehouse.name})`;
        // Look for existing default location with NEW format
        let defaultLocation = await this.prisma.location.findFirst({
            where: {
                warehouseId,
                code: locCode
            }
        });
        // Option: Check for OLD format if new one doesn't exist?
        // If we want to migrate, we could rename here.
        // For now, we prefer creating the NEW clean one for new assignments.
        // If we want to reuse the OLD one if it exists, uncomment below:
        /*
    if (!defaultLocation) {
       defaultLocation = await this.prisma.location.findFirst({
         where: { warehouseId, code: `DEF-${warehouseId}` }
       });
    }
    */ // Create if doesn't exist
        if (!defaultLocation) {
            defaultLocation = await this.prisma.location.create({
                data: {
                    warehouseId,
                    code: locCode,
                    barcode: locCode,
                    name: locName,
                    layer: 1,
                    corridor: 'A',
                    side: 1,
                    section: 1,
                    level: 1,
                    active: true
                }
            });
        }
        return defaultLocation;
    }
    async getProductStockHistory(productId, date) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // 1. Get all active warehouses for this tenant
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
        const warehouseTotals = {};
        warehouses.forEach((w)=>{
            warehouseTotals[w.id] = {
                id: w.id,
                name: w.name,
                code: w.code,
                quantity: 0
            };
        });
        // 2. Get current stock levels per warehouse for this product
        const currentStocks = await this.prisma.productLocationStock.findMany({
            where: {
                productId,
                warehouseId: {
                    in: warehouses.map((w)=>w.id)
                }
            }
        });
        currentStocks.forEach((stock)=>{
            if (warehouseTotals[stock.warehouseId]) {
                warehouseTotals[stock.warehouseId].quantity += stock.qtyOnHand;
            }
        });
        // 3. Normalize target date to END OF DAY (23:59:59.999)
        // This ensures we show the stock AFTER all moves of that day
        const targetDateEnd = new Date(date);
        targetDateEnd.setHours(23, 59, 59, 999);
        // 4. Fetch all StockMove records for this product created AFTER the target date
        const movesAfterDate = await this.prisma.stockMove.findMany({
            where: {
                productId,
                createdAt: {
                    gt: targetDateEnd
                }
            }
        });
        // 5. Backtrack: Adjust current quantities based on moves that happened AFTER the date
        for (const move of movesAfterDate){
            if (move.fromWarehouseId && warehouseTotals[move.fromWarehouseId]) {
                warehouseTotals[move.fromWarehouseId].quantity += move.qty;
            }
            const isOutgoingOnly = [
                'SALE',
                'PICKING',
                'DAMAGE'
            ].includes(move.moveType);
            if (move.toWarehouseId && warehouseTotals[move.toWarehouseId] && !isOutgoingOnly) {
                warehouseTotals[move.toWarehouseId].quantity -= move.qty;
            }
        }
        return Object.values(warehouseTotals);
    }
    async getUniversalStockReport(date) {
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
        // 2. Get all products that have or had stock movements/records
        // To keep it performant, we only get products that have ProductLocationStock records
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
                        unit: true
                    }
                }
            }
        });
        // 3. Normalize data into a matrix: Product ID -> { productInfo, warehouseQuantities: { warehouseId: qty } }
        const productMatrix = {};
        currentStocks.forEach((stock)=>{
            const pId = stock.productId;
            if (!productMatrix[pId]) {
                productMatrix[pId] = {
                    productId: pId,
                    code: stock.product.code,
                    name: stock.product.name,
                    birim: stock.product.unit,
                    warehouseStocks: {},
                    total: 0
                };
                // Initialize all warehouses with 0
                warehouses.forEach((w)=>{
                    productMatrix[pId].warehouseStocks[w.id] = 0;
                });
            }
            productMatrix[pId].warehouseStocks[stock.warehouseId] += stock.qtyOnHand;
            productMatrix[pId].total += stock.qtyOnHand;
        });
        // 4. Backtrack if date is in the past
        const targetDateEnd = new Date(date);
        targetDateEnd.setHours(23, 59, 59, 999);
        const now = new Date();
        if (targetDateEnd < now) {
            const movesAfterDate = await this.prisma.stockMove.findMany({
                where: {
                    createdAt: {
                        gt: targetDateEnd
                    },
                    product: {
                        ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                    }
                }
            });
            movesAfterDate.forEach((move)=>{
                const pId = move.productId;
                // If product isn't in matrix yet but had moves, we might need to add it
                // However, usually any product with moves was in ProductLocationStock at some point.
                // For simplicity, we ensure the matrix entry exists
                if (!productMatrix[pId]) {
                    // This is a rare case where current stock is 0 everywhere and was never initialized
                    // We'd need product info here. For now, let's assume currentStocks covers active products.
                    return;
                }
                // Undo move
                if (move.fromWarehouseId && productMatrix[pId].warehouseStocks[move.fromWarehouseId] !== undefined) {
                    productMatrix[pId].warehouseStocks[move.fromWarehouseId] += move.qty;
                    productMatrix[pId].total += move.qty;
                }
                const isOutgoingOnly = [
                    'SALE',
                    'PICKING',
                    'DAMAGE'
                ].includes(move.moveType);
                if (move.toWarehouseId && productMatrix[pId].warehouseStocks[move.toWarehouseId] !== undefined && !isOutgoingOnly) {
                    productMatrix[pId].warehouseStocks[move.toWarehouseId] -= move.qty;
                    productMatrix[pId].total -= move.qty;
                }
            });
        }
        return {
            warehouses,
            report: Object.values(productMatrix)
        };
    }
    async getWarehouseStock(warehouseId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const warehouse = await this.prisma.warehouse.findFirst({
            where: {
                id: warehouseId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!warehouse) {
            throw new _common.NotFoundException('Warehouse not found');
        }
        const stocks = await this.prisma.productLocationStock.groupBy({
            by: [
                'productId'
            ],
            where: {
                warehouseId
            },
            _sum: {
                qtyOnHand: true
            }
        });
        const productsWithStock = await Promise.all(stocks.map(async (stock)=>{
            const product = await this.prisma.product.findUnique({
                where: {
                    id: stock.productId
                },
                select: {
                    id: true,
                    code: true,
                    name: true,
                    unit: true
                }
            });
            return {
                ...product ? {
                    ...product,
                    // Backward-compatible aliases
                    code: product.code,
                    name: product.name,
                    birim: product.unit
                } : product,
                qtyOnHand: stock._sum.qtyOnHand || 0
            };
        }));
        return productsWithStock;
    }
    async getDefaultWarehouse() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.warehouse.findFirst({
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                active: true,
                isDefault: true
            }
        });
    }
    constructor(prisma, tenantResolver, codeTemplateService){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.codeTemplateService = codeTemplateService;
    }
};
WarehouseService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(2, (0, _common.Inject)((0, _common.forwardRef)(()=>_codetemplateservice.CodeTemplateService))),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService
    ])
], WarehouseService);

//# sourceMappingURL=warehouse.service.js.map