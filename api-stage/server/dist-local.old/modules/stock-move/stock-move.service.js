"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StockMoveService", {
    enumerable: true,
    get: function() {
        return StockMoveService;
    }
});
const _stagingutil = require("../../common/utils/staging.util");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _createstockmovedto = require("./dto/create-stock-move.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let StockMoveService = class StockMoveService {
    /**
   * ProductLocationStock bakiyesini günceller (veya oluşturur)
   */ async updateProductLocationStock(warehouseId, locationId, productId, qtyChange, prisma) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // Mevcut bakiye kaydını bul veya oluştur
        let stock = await prisma.productLocationStock.findFirst({
            where: {
                warehouseId,
                locationId,
                productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (stock) {
            // Mevcut bakiye güncelle
            const newQty = stock.qtyOnHand + qtyChange;
            // Negatif product kontrolü
            if (newQty < 0) {
                throw new _common.BadRequestException('Negative product is forbidden');
            }
            stock = await prisma.productLocationStock.update({
                where: {
                    id: stock.id
                },
                data: {
                    qtyOnHand: newQty
                }
            });
        } else {
            // Yeni bakiye kaydı oluştur
            if (qtyChange < 0) {
                throw new _common.BadRequestException('Negative product is forbidden');
            }
            stock = await prisma.productLocationStock.create({
                data: {
                    warehouseId,
                    locationId,
                    productId,
                    qtyOnHand: qtyChange,
                    tenantId: tenantId
                }
            });
        }
        return stock;
    }
    /**
   * Assign Location: Sadece raf adresi tanımlama (product hareketi yok)
   */ async assignLocation(assignLocationDto, userId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // Ürün kontrolü
        const product = await this.prisma.product.findFirst({
            where: {
                id: assignLocationDto.productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!product) {
            throw new _common.NotFoundException('Product not found');
        }
        // Hedef depo kontrolü
        const toWarehouse = await this.prisma.warehouse.findFirst({
            where: {
                id: assignLocationDto.toWarehouseId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!toWarehouse) {
            throw new _common.NotFoundException('Target warehouse not found');
        }
        if (!toWarehouse.active) {
            throw new _common.BadRequestException('Target warehouse is not active');
        }
        // Hedef raf kontrolü
        const toLocation = await this.prisma.location.findFirst({
            where: {
                id: assignLocationDto.toLocationId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!toLocation) {
            throw new _common.NotFoundException('Target shelf not found');
        }
        if (!toLocation.active) {
            throw new _common.BadRequestException('Target shelf is not active');
        }
        if (toLocation.warehouseId !== assignLocationDto.toWarehouseId) {
            throw new _common.BadRequestException('Target shelf does not belong to the target warehouse');
        }
        // ProductLocationStock kaydı oluştur veya güncelle
        return this.prisma.$transaction(async (prisma)=>{
            let stock = await prisma.productLocationStock.findFirst({
                where: {
                    warehouseId: assignLocationDto.toWarehouseId,
                    locationId: assignLocationDto.toLocationId,
                    productId: assignLocationDto.productId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            const qty = assignLocationDto.qty || 0;
            if (stock) {
                // Mevcut kayıt varsa güncelle
                stock = await prisma.productLocationStock.update({
                    where: {
                        id: stock.id
                    },
                    data: {
                        qtyOnHand: stock.qtyOnHand + qty
                    }
                });
            } else {
                // Yeni kayıt oluştur
                stock = await prisma.productLocationStock.create({
                    data: {
                        warehouseId: assignLocationDto.toWarehouseId,
                        locationId: assignLocationDto.toLocationId,
                        productId: assignLocationDto.productId,
                        qtyOnHand: qty,
                        tenantId: tenantId
                    }
                });
            }
            return {
                message: qty > 0 ? `Self address defined and ${qty} products added` : 'Shelf address defined (without product movement)',
                stock
            };
        });
    }
    /**
   * Put-Away: Ürünü rafa yerleştirme (Gerçek product hareketi ile)
   */ async putAway(putAwayDto, userId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // Ürün kontrolü
        const product = await this.prisma.product.findFirst({
            where: {
                id: putAwayDto.productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!product) {
            throw new _common.NotFoundException('Product not found');
        }
        // Ürünün toplam product quantityını hesapla (ProductMovement tablosundan, iptal faturalar hariç)
        const stokHareketler = await this.prisma.productMovement.findMany({
            where: {
                productId: putAwayDto.productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                invoiceItem: {
                    include: {
                        invoice: {
                            select: {
                                status: true
                            }
                        }
                    }
                }
            }
        });
        let toplamStok = 0;
        stokHareketler.forEach((hareket)=>{
            if (hareket.invoiceItem?.invoice?.status === 'CANCELLED') return;
            if (hareket.movementType === 'ENTRY' || hareket.movementType === 'COUNT_SURPLUS' || hareket.movementType === 'RETURN' || hareket.movementType === 'CANCELLATION_ENTRY') {
                toplamStok += hareket.quantity;
            } else if (hareket.movementType === 'EXIT' || hareket.movementType === 'SALE' || hareket.movementType === 'COUNT_SHORTAGE' || hareket.movementType === 'CANCELLATION_EXIT') {
                toplamStok -= hareket.quantity;
            }
        });
        // Raflardaki toplam product
        const rafToplamStok = await this.prisma.productLocationStock.aggregate({
            where: {
                productId: putAwayDto.productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            _sum: {
                qtyOnHand: true
            }
        });
        const mevcutRafStok = rafToplamStok._sum.qtyOnHand || 0;
        const yerlestirilecekStok = mevcutRafStok + putAwayDto.qty;
        // Toplam product kontrolü
        if (yerlestirilecekStok > toplamStok) {
            throw new _common.BadRequestException(`Error: Total product (${toplamStok}) is insufficient! There are ${mevcutRafStok} units on the shelves, you want to add ${putAwayDto.qty} units. You can add a maximum of ${toplamStok - mevcutRafStok} units.`);
        }
        // Hedef depo kontrolü
        const toWarehouse = await this.prisma.warehouse.findFirst({
            where: {
                id: putAwayDto.toWarehouseId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!toWarehouse) {
            throw new _common.NotFoundException('Target warehouse not found');
        }
        if (!toWarehouse.active) {
            throw new _common.BadRequestException('Target warehouse is not active');
        }
        // Hedef raf kontrolü
        const toLocation = await this.prisma.location.findFirst({
            where: {
                id: putAwayDto.toLocationId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!toLocation) {
            throw new _common.NotFoundException('Target shelf not found');
        }
        if (!toLocation.active) {
            throw new _common.BadRequestException('Target shelf is not active');
        }
        if (toLocation.warehouseId !== putAwayDto.toWarehouseId) {
            throw new _common.BadRequestException('Target shelf does not belong to the target warehouse');
        }
        // Transaction içinde işlem yap
        return this.prisma.$transaction(async (prisma)=>{
            // Stok bakiye güncelle (hedef rafa ekle)
            await this.updateProductLocationStock(putAwayDto.toWarehouseId, putAwayDto.toLocationId, putAwayDto.productId, putAwayDto.qty, prisma);
            // Stok hareketi kaydı oluştur
            const stockMove = await prisma.stockMove.create({
                data: {
                    productId: putAwayDto.productId,
                    fromWarehouseId: null,
                    fromLocationId: null,
                    toWarehouseId: putAwayDto.toWarehouseId,
                    toLocationId: putAwayDto.toLocationId,
                    quantity: putAwayDto.qty,
                    moveType: _createstockmovedto.StockMoveType.PUT_AWAY,
                    refType: 'PutAway',
                    notes: putAwayDto.note,
                    createdBy: userId,
                    tenantId: tenantId
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    },
                    toWarehouse: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    },
                    toLocation: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    }
                }
            });
            return stockMove;
        });
    }
    /**
   * Bulk Put-Away: Toplu ürün yerleştirme (Excel ile)
   */ async bulkPutAway(bulkPutAwayDto, userId) {
        const results = {
            success: [],
            failed: [],
            total: bulkPutAwayDto.operations.length
        };
        // Her bir işlemi sırayla yap
        for (const [index, operation] of bulkPutAwayDto.operations.entries()){
            try {
                const stockMove = await this.putAway(operation, userId);
                results.success.push({
                    index: index + 1,
                    operation,
                    stockMove
                });
            } catch (error) {
                results.failed.push({
                    index: index + 1,
                    operation,
                    error: error.message || 'Unknown error'
                });
            }
        }
        return {
            ...results,
            successCount: results.success.length,
            failedCount: results.failed.length
        };
    }
    /**
   * Transfer: Raflar arası transfer
   */ async transfer(transferDto, userId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        // Ürün kontrolü
        const product = await this.prisma.product.findFirst({
            where: {
                id: transferDto.productId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!product) {
            throw new _common.NotFoundException('Product not found');
        }
        // Kaynak depo kontrolü
        const fromWarehouse = await this.prisma.warehouse.findFirst({
            where: {
                id: transferDto.fromWarehouseId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!fromWarehouse) {
            throw new _common.NotFoundException('Source warehouse not found');
        }
        if (!fromWarehouse.active) {
            throw new _common.BadRequestException('Source warehouse is not active');
        }
        // Kaynak raf kontrolü
        const fromLocation = await this.prisma.location.findFirst({
            where: {
                id: transferDto.fromLocationId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!fromLocation) {
            throw new _common.NotFoundException('Source shelf not found');
        }
        if (!fromLocation.active) {
            throw new _common.BadRequestException('Source shelf is not active');
        }
        if (fromLocation.warehouseId !== transferDto.fromWarehouseId) {
            throw new _common.BadRequestException('Source shelf does not belong to the source warehouse');
        }
        // Hedef depo kontrolü
        const toWarehouse = await this.prisma.warehouse.findFirst({
            where: {
                id: transferDto.toWarehouseId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!toWarehouse) {
            throw new _common.NotFoundException('Target warehouse not found');
        }
        if (!toWarehouse.active) {
            throw new _common.BadRequestException('Target warehouse is not active');
        }
        // Hedef raf kontrolü
        const toLocation = await this.prisma.location.findFirst({
            where: {
                id: transferDto.toLocationId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!toLocation) {
            throw new _common.NotFoundException('Target shelf not found');
        }
        if (!toLocation.active) {
            throw new _common.BadRequestException('Target shelf is not active');
        }
        if (toLocation.warehouseId !== transferDto.toWarehouseId) {
            throw new _common.BadRequestException('Target shelf does not belong to the target warehouse');
        }
        // Kaynak = Hedef kontrolü
        if (transferDto.fromWarehouseId === transferDto.toWarehouseId && transferDto.fromLocationId === transferDto.toLocationId) {
            throw new _common.BadRequestException('Source and target shelf cannot be the same');
        }
        // Transaction içinde işlem yap
        return this.prisma.$transaction(async (prisma)=>{
            // Kaynak rafta yeterli product var mı kontrol et
            const sourceStock = await prisma.productLocationStock.findFirst({
                where: {
                    warehouseId: transferDto.fromWarehouseId,
                    locationId: transferDto.fromLocationId,
                    productId: transferDto.productId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                }
            });
            if (!sourceStock || sourceStock.qtyOnHand < transferDto.qty) {
                throw new _common.BadRequestException('Not enough products on the source shelf');
            }
            // Kaynak raftan çıkar
            await this.updateProductLocationStock(transferDto.fromWarehouseId, transferDto.fromLocationId, transferDto.productId, -transferDto.qty, prisma);
            // Hedef rafa ekle
            await this.updateProductLocationStock(transferDto.toWarehouseId, transferDto.toLocationId, transferDto.productId, transferDto.qty, prisma);
            // Stok hareketi kaydı oluştur
            const stockMove = await prisma.stockMove.create({
                data: {
                    productId: transferDto.productId,
                    fromWarehouseId: transferDto.fromWarehouseId,
                    fromLocationId: transferDto.fromLocationId,
                    toWarehouseId: transferDto.toWarehouseId,
                    toLocationId: transferDto.toLocationId,
                    quantity: transferDto.qty,
                    moveType: _createstockmovedto.StockMoveType.TRANSFER,
                    refType: 'Transfer',
                    notes: transferDto.note,
                    createdBy: userId,
                    tenantId: tenantId
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    },
                    fromWarehouse: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    },
                    fromLocation: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    },
                    toWarehouse: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    },
                    toLocation: {
                        select: {
                            id: true,
                            code: true,
                            name: true
                        }
                    }
                }
            });
            return stockMove;
        });
    }
    async findAll(productId, warehouseId, locationId, moveType, limit) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (productId) {
            where.productId = productId;
        }
        if (warehouseId) {
            where.OR = [
                {
                    fromWarehouseId: warehouseId
                },
                {
                    toWarehouseId: warehouseId
                }
            ];
        }
        if (locationId) {
            where.OR = [
                {
                    fromLocationId: locationId
                },
                {
                    toLocationId: locationId
                }
            ];
        }
        if (moveType) {
            where.moveType = moveType;
        }
        return this.prisma.stockMove.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        brand: true
                    }
                },
                fromWarehouse: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                },
                fromLocation: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                },
                toWarehouse: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                },
                toLocation: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                },
                createdByUser: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit || 100
        });
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const stockMove = await this.prisma.stockMove.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                product: true,
                fromWarehouse: true,
                fromLocation: true,
                toWarehouse: true,
                toLocation: true,
                createdByUser: true
            }
        });
        if (!stockMove) {
            throw new _common.NotFoundException('Stock movement not found');
        }
        return stockMove;
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
StockMoveService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], StockMoveService);

//# sourceMappingURL=stock-move.service.js.map