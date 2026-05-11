"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WarehouseTransferService", {
    enumerable: true,
    get: function() {
        return WarehouseTransferService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _codetemplateservice = require("../code-template/code-template.service");
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
let WarehouseTransferService = class WarehouseTransferService {
    async findAll(status) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            deletedAt: null
        };
        if (status) where.status = status;
        return this.prisma.warehouseTransfer.findMany({
            where,
            include: {
                fromWarehouse: true,
                toWarehouse: true,
                items: {
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
                },
                preparedByUser: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                approvedByUser: {
                    select: {
                        id: true,
                        fullName: true
                    }
                },
                receivedByUser: {
                    select: {
                        id: true,
                        fullName: true
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
        const transfer = await this.prisma.warehouseTransfer.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            },
            include: {
                fromWarehouse: true,
                toWarehouse: true,
                items: {
                    include: {
                        product: true,
                        fromLocation: true,
                        toLocation: true
                    }
                },
                preparedByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                approvedByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                receivedByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                logs: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
        if (!transfer) {
            throw new _common.NotFoundException('Transfer slip not found');
        }
        return transfer;
    }
    async create(createDto) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            allowNull: true
        });
        // Aynı ambardan aynı ambara transfer kontrolü
        if (createDto.fromWarehouseId === createDto.toWarehouseId) {
            throw new _common.BadRequestException('Kaynak ve hedef ambar aynı olamaz');
        }
        // Transfer numarası oluştur
        let transferNo;
        try {
            transferNo = await this.codeTemplateService.getNextCode('WAREHOUSE_TRANSFER');
        } catch (error) {
            // Fallback to manual numbering
            const count = await this.prisma.warehouseTransfer.count({
                where: (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            });
            transferNo = `TRF-${String(count + 1).padStart(6, '0')}`;
        }
        // Kaynak ambarda yeterli product var mı kontrol et
        for (const kalem of createDto.items){
            const stock = await this.checkStock(createDto.fromWarehouseId, kalem.productId);
            if (stock < kalem.quantity) {
                const product = await this.prisma.product.findUnique({
                    where: {
                        id: kalem.productId
                    },
                    select: {
                        code: true,
                        name: true
                    }
                });
                throw new _common.BadRequestException(`${product?.code} - ${product?.name} için kaynak ambarda yeterli product yok. Mevcut: ${stock}, İstenen: ${kalem.quantity}`);
            }
        }
        // Transfer fişi oluştur
        const transfer = await this.prisma.warehouseTransfer.create({
            data: {
                transferNo,
                ...tenantId && {
                    tenantId
                },
                date: new Date(createDto.date),
                fromWarehouseId: createDto.fromWarehouseId,
                toWarehouseId: createDto.toWarehouseId,
                status: 'PREPARING',
                driverName: createDto.driverName,
                vehiclePlate: createDto.vehiclePlate,
                notes: createDto.notes,
                createdBy: createDto.userId,
                preparedById: createDto.userId,
                items: {
                    create: createDto.items.map((kalem)=>({
                            productId: kalem.productId,
                            quantity: kalem.quantity,
                            fromLocationId: kalem.fromLocationId,
                            toLocationId: kalem.toLocationId
                        }))
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                fromWarehouse: true,
                toWarehouse: true
            }
        });
        // Update code template counter
        await this.codeTemplateService.saveLastCode('WAREHOUSE_TRANSFER', transfer.transferNo);
        // Log kaydı oluştur
        await this.createLog(transfer.id, createDto.userId, 'CREATE', {
            action: 'Transfer fişi oluşturuldu'
        });
        return transfer;
    }
    async update(id, updateDto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const transfer = await this.prisma.warehouseTransfer.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            }
        });
        if (!transfer) {
            throw new _common.NotFoundException('Transfer slip not found');
        }
        if (transfer.status !== 'PREPARING') {
            throw new _common.BadRequestException('Sadece hazırlanıyor statusundaki fişler düzenlenebilir');
        }
        const { userId, items, ...dataToUpdate } = updateDto;
        return this.prisma.warehouseTransfer.update({
            where: {
                id
            },
            data: {
                ...dataToUpdate,
                updatedBy: userId
            }
        });
    }
    async approve(id, userId) {
        const transfer = await this.prisma.warehouseTransfer.findUnique({
            where: {
                id
            },
            include: {
                items: true
            }
        });
        if (!transfer) throw new _common.NotFoundException('Transfer slip not found');
        if (transfer.status !== 'PREPARING') {
            throw new _common.BadRequestException('Sadece hazırlanıyor statusundaki fişler onaylanabilir');
        }
        // Stok kontrolü tekrar yap
        for (const kalem of transfer.items){
            const stock = await this.checkStock(transfer.fromWarehouseId, kalem.productId);
            if (stock < kalem.quantity) {
                const product = await this.prisma.product.findUnique({
                    where: {
                        id: kalem.productId
                    },
                    select: {
                        code: true,
                        name: true
                    }
                });
                throw new _common.BadRequestException(`${product?.code} - ${product?.name} için kaynak ambarda yeterli product yok. Mevcut: ${stock}, İstenen: ${kalem.quantity}`);
            }
        }
        // Varsayılan lokasyonları al
        const fromDefaultLocation = await this.getDefaultLocation(transfer.fromWarehouseId);
        const toDefaultLocation = await this.getDefaultLocation(transfer.toWarehouseId);
        // Stok hareketlerini oluştur
        for (const kalem of transfer.items){
            await this.prisma.stockMove.create({
                data: {
                    productId: kalem.productId,
                    fromWarehouseId: transfer.fromWarehouseId,
                    fromLocationId: kalem.fromLocationId || fromDefaultLocation.id,
                    toWarehouseId: transfer.toWarehouseId,
                    toLocationId: kalem.toLocationId || toDefaultLocation.id,
                    quantity: kalem.quantity,
                    moveType: 'TRANSFER',
                    refType: 'WarehouseTransfer',
                    refId: transfer.id,
                    createdBy: userId
                }
            });
            // ProductLocationStock güncelle - Kaynak ambardan düş
            await this.updateProductLocationStock(transfer.fromWarehouseId, kalem.fromLocationId, kalem.productId, -kalem.quantity);
            // ProductLocationStock güncelle - Hedef ambara ekle
            await this.updateProductLocationStock(transfer.toWarehouseId, kalem.toLocationId || kalem.fromLocationId, kalem.productId, kalem.quantity);
        }
        // Transfer statusunu güncelle
        const updated = await this.prisma.warehouseTransfer.update({
            where: {
                id
            },
            data: {
                status: 'IN_TRANSIT',
                approvedById: userId,
                shippingDate: new Date(),
                updatedBy: userId
            }
        });
        await this.createLog(id, userId, 'UPDATE', {
            action: 'Transfer fişi onaylandı ve product hareketleri oluşturuldu'
        });
        return updated;
    }
    async complete(id, userId) {
        const transfer = await this.prisma.warehouseTransfer.findUnique({
            where: {
                id
            }
        });
        if (!transfer) throw new _common.NotFoundException('Transfer slip not found');
        if (transfer.status !== 'IN_TRANSIT') {
            throw new _common.BadRequestException('Sadece yolda statusundaki fişler tamamlanabilir');
        }
        const updated = await this.prisma.warehouseTransfer.update({
            where: {
                id
            },
            data: {
                status: 'COMPLETED',
                receivedById: userId,
                deliveryDate: new Date(),
                updatedBy: userId
            }
        });
        await this.createLog(id, userId, 'UPDATE', {
            action: 'Transfer fişi tamamlandı'
        });
        return updated;
    }
    async cancel(id, userId, reason) {
        const transfer = await this.prisma.warehouseTransfer.findUnique({
            where: {
                id
            },
            include: {
                items: true
            }
        });
        if (!transfer) throw new _common.NotFoundException('Transfer slip not found');
        if (transfer.status === 'COMPLETED') {
            throw new _common.BadRequestException('Tamamlanmış fişler iptal edilemez');
        }
        if (transfer.status === 'CANCELLED') {
            throw new _common.BadRequestException('Fiş zaten iptal edilmiş');
        }
        // Eğer YOLDA statusundaysa product hareketlerini geri al
        if (transfer.status === 'IN_TRANSIT') {
            for (const kalem of transfer.items){
                // Kaynak ambara geri ekle
                await this.updateProductLocationStock(transfer.fromWarehouseId, kalem.fromLocationId, kalem.productId, kalem.quantity);
                // Hedef ambardan düş
                await this.updateProductLocationStock(transfer.toWarehouseId, kalem.toLocationId || kalem.fromLocationId, kalem.productId, -kalem.quantity);
            }
        }
        const updated = await this.prisma.warehouseTransfer.update({
            where: {
                id
            },
            data: {
                status: 'CANCELLED',
                updatedBy: userId
            }
        });
        await this.createLog(id, userId, 'UPDATE', {
            action: 'Transfer fişi iptal edildi',
            reason
        });
        return updated;
    }
    async remove(id) {
        const transfer = await this.prisma.warehouseTransfer.findUnique({
            where: {
                id
            }
        });
        if (!transfer) throw new _common.NotFoundException('Transfer slip not found');
        if (transfer.status === 'IN_TRANSIT' || transfer.status === 'COMPLETED') {
            throw new _common.BadRequestException('Yolda veya tamamlanmış fişler silinemez. Önce iptal edin.');
        }
        return this.prisma.warehouseTransfer.update({
            where: {
                id
            },
            data: {
                deletedAt: new Date()
            }
        });
    }
    async checkStock(warehouseId, productId) {
        const result = await this.prisma.productLocationStock.aggregate({
            where: {
                warehouseId,
                productId
            },
            _sum: {
                qtyOnHand: true
            }
        });
        return result._sum.qtyOnHand || 0;
    }
    async updateProductLocationStock(warehouseId, locationId, productId, qtyChange) {
        // Lokasyon belirtilmemişse varsayılan lokasyonu kullan
        let finalLocationId = locationId;
        if (!finalLocationId) {
            const defaultLocation = await this.getDefaultLocation(warehouseId);
            finalLocationId = defaultLocation.id;
        }
        const existing = await this.prisma.productLocationStock.findUnique({
            where: {
                warehouseId_locationId_productId: {
                    warehouseId,
                    locationId: finalLocationId,
                    productId
                }
            }
        });
        if (existing) {
            const newQty = existing.qtyOnHand + qtyChange;
            if (newQty < 0) {
                throw new _common.BadRequestException('Stok quantityı negatif olamaz');
            }
            await this.prisma.productLocationStock.update({
                where: {
                    id: existing.id
                },
                data: {
                    qtyOnHand: newQty
                }
            });
        } else if (qtyChange > 0) {
            await this.prisma.productLocationStock.create({
                data: {
                    warehouseId,
                    locationId: finalLocationId,
                    productId,
                    qtyOnHand: qtyChange
                }
            });
        }
    }
    async getDefaultLocation(warehouseId) {
        const location = await this.prisma.location.findFirst({
            where: {
                warehouseId,
                active: true
            },
            orderBy: {
                code: 'asc'
            }
        });
        if (!location) {
            throw new _common.BadRequestException('Active location not found in warehouse');
        }
        return location;
    }
    async createLog(transferId, userId, actionType, changes) {
        await this.prisma.warehouseTransferLog.create({
            data: {
                transferId,
                userId,
                actionType: actionType,
                changes: JSON.stringify(changes)
            }
        });
    }
    constructor(prisma, tenantResolver, codeTemplateService){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.codeTemplateService = codeTemplateService;
    }
};
WarehouseTransferService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(2, (0, _common.Inject)((0, _common.forwardRef)(()=>_codetemplateservice.CodeTemplateService))),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService
    ])
], WarehouseTransferService);

//# sourceMappingURL=warehouse-transfer.service.js.map