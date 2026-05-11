"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StockEffectService", {
    enumerable: true,
    get: function() {
        return StockEffectService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _library = require("@prisma/client/runtime/library");
const _movementtypehelper = require("../helpers/movement-type.helper");
const _invoiceorchestratortypes = require("../types/invoice-orchestrator.types");
const _systemparameterservice = require("../../system-parameter/system-parameter.service");
const _warehouseservice = require("../../warehouse/warehouse.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let StockEffectService = class StockEffectService {
    /**
     * Fatura onaylandığında veya iptal edildiğinde stok etkilerini uygular.
     * 
     * @param invoice Fatura ve kalemleri
     * @param tx Prisma Transaction Client
     * @param operationType İşlem tipi (APPROVE | CANCEL)
     */ async applyStockEffects(invoice, tx, operationType) {
        const movements = [];
        const tenantId = invoice.tenantId;
        if (!tenantId) {
            throw new Error('Tenant ID is missing in invoice context');
        }
        // Negatif stok kontrolü parametresini al
        const negativeStockControl = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_STOCK_CONTROL', false);
        // WMS modülü aktif mi kontrol et
        const isWmsEnabled = await this.systemParameterService.getParameterAsBoolean('ENABLE_WMS_MODULE', false);
        for (const item of invoice.items){
            const baseQuantity = this.calculateBaseQuantity(item);
            if (baseQuantity.lte(0)) {
                this.logger.warn(`Skipping item with zero or negative quantity: Product ${item.productId}, Invoice ${invoice.id}`);
                continue;
            }
            const movementType = (0, _movementtypehelper.resolveStockMovementType)(invoice.invoiceType, operationType);
            if (!movementType) {
                continue;
            }
            const direction = this.getDirectionFromMovementType(movementType);
            const warehouseId = item.shelf || invoice.warehouseId; // Kalem seviyesinde depo yoksa fatura deposu
            if (!warehouseId) {
                throw new _common.BadRequestException(`Warehouse ID is missing for product: ${item.product?.name || item.productId}`);
            }
            // Stok seviyesini güncelle ve varsa kontrol yap
            await this.updateStockLevel(tx, tenantId, warehouseId, item.productId, baseQuantity, direction, negativeStockControl, item.product?.name || 'Unknown Product');
            // Stok hareketi kaydı oluştur
            const movement = await tx.productMovement.create({
                data: {
                    tenant: {
                        connect: {
                            id: tenantId
                        }
                    },
                    product: {
                        connect: {
                            id: item.productId
                        }
                    },
                    warehouse: {
                        connect: {
                            id: warehouseId
                        }
                    },
                    movementType,
                    quantity: Math.round(Number(direction === _invoiceorchestratortypes.StockMovementDirection.OUT ? baseQuantity.negated() : baseQuantity)),
                    unitPrice: item.unitPrice,
                    invoiceItem: {
                        connect: {
                            id: item.id
                        }
                    },
                    notes: operationType === 'CANCEL' ? `Cancelled: ${invoice.invoiceNo}` : `Approved: ${invoice.invoiceNo}`,
                    recordType: operationType === 'CANCEL' ? 'CANCEL_REVERSAL' : 'NORMAL'
                }
            });
            // WMS aktifse stock_moves tablosuna da yaz
            if (isWmsEnabled) {
                await this.createWmsMove(tx, tenantId, warehouseId, item, invoice, direction, operationType, baseQuantity);
            }
            movements.push({
                productId: item.productId,
                warehouseId,
                quantity: baseQuantity,
                direction,
                movementType,
                invoiceId: invoice.id,
                invoiceItemId: item.id,
                tenantId
            });
        }
        return movements;
    }
    /**
     * Mevcut stok etkilerini tersine çevirir (UPDATE senaryosu için).
     * 
     * @param invoiceId Fatura ID
     * @param tenantId Kiracı ID
     * @param tx Prisma Transaction Client
     */ async reverseStockEffects(invoiceId, tenantId, tx, isDraftRevert = false) {
        // Faturaya ait henüz tersi alınmamış hareketleri bul
        const originalMovements = await tx.productMovement.findMany({
            where: {
                invoiceItem: {
                    invoiceId
                },
                tenantId,
                isReversed: false,
                deletedAt: null
            },
            include: {
                product: true
            }
        });
        if (originalMovements.length === 0) {
            return {
                stockMovementsReversed: 0,
                accountMovementReversed: false
            };
        }
        for (const mov of originalMovements){
            const quantity = new _library.Decimal(Math.abs(mov.quantity));
            const reverseDirection = mov.quantity > 0 ? _invoiceorchestratortypes.StockMovementDirection.OUT : _invoiceorchestratortypes.StockMovementDirection.IN;
            const reverseMovementType = reverseDirection === _invoiceorchestratortypes.StockMovementDirection.OUT ? _client.MovementType.EXIT : _client.MovementType.ENTRY;
            // Stok seviyesini ters yönde güncelle (Geri alma işleminde negatif kontrolü genellikle kapatılır veya esnetilir)
            await this.updateStockLevel(tx, tenantId, mov.warehouseId, mov.productId, quantity, reverseDirection, false, mov.product?.name || 'Unknown');
            if (isDraftRevert) {
                // Taslağa dönüldüğünde ters kayıt atmak yerine orijinal hareketi soft-delete yap
                await tx.productMovement.update({
                    where: {
                        id: mov.id
                    },
                    data: {
                        deletedAt: new Date()
                    }
                });
            } else {
                // Ters kayıt oluştur
                await tx.productMovement.create({
                    data: {
                        tenant: {
                            connect: {
                                id: tenantId
                            }
                        },
                        product: {
                            connect: {
                                id: mov.productId
                            }
                        },
                        warehouse: mov.warehouseId ? {
                            connect: {
                                id: mov.warehouseId
                            }
                        } : undefined,
                        movementType: reverseMovementType,
                        quantity: reverseDirection === _invoiceorchestratortypes.StockMovementDirection.OUT ? -quantity.toNumber() : quantity.toNumber(),
                        unitPrice: mov.unitPrice,
                        invoiceItem: mov.invoiceItemId ? {
                            connect: {
                                id: mov.invoiceItemId
                            }
                        } : undefined,
                        notes: `Reversal of movement ${mov.id}`,
                        isReversed: true,
                        reversalOf: {
                            connect: {
                                id: mov.id
                            }
                        },
                        recordType: 'UPDATE_REVERSAL'
                    }
                });
                // Orijinal kaydı tersi alınmış olarak işaretle
                await tx.productMovement.update({
                    where: {
                        id: mov.id
                    },
                    data: {
                        isReversed: true
                    }
                });
            }
        }
        return {
            stockMovementsReversed: originalMovements.length,
            accountMovementReversed: false
        };
    }
    /**
     * Stok seviyesini (ProductLocationStock) günceller.
     */ async updateStockLevel(tx, tenantId, warehouseId, productId, quantity, direction, negativeControl, productName) {
        const defaultLocation = await this.warehouseService.getOrCreateDefaultLocation(warehouseId);
        // Mevcut stok kaydını bul veya oluştur
        const stock = await tx.productLocationStock.findFirst({
            where: {
                tenantId,
                warehouseId,
                locationId: defaultLocation.id,
                productId
            }
        });
        const qtyDelta = Math.round(Number(direction === _invoiceorchestratortypes.StockMovementDirection.IN ? quantity : quantity.negated()));
        if (stock) {
            const newQty = stock.qtyOnHand + qtyDelta;
            if (negativeControl && newQty < 0) {
                throw new _common.BadRequestException(`Insufficient stock: ${productName}. Available in warehouse: ${stock.qtyOnHand}`);
            }
            await tx.productLocationStock.update({
                where: {
                    id: stock.id
                },
                data: {
                    qtyOnHand: newQty
                }
            });
        } else {
            if (negativeControl && qtyDelta < 0) {
                throw new _common.BadRequestException(`Insufficient stock: ${productName}. Available in warehouse: 0`);
            }
            await tx.productLocationStock.create({
                data: {
                    tenantId,
                    warehouseId,
                    locationId: defaultLocation.id,
                    productId,
                    qtyOnHand: qtyDelta
                }
            });
        }
    }
    /**
     * WMS Modülü aktifse StockMove kaydı oluşturur.
     */ async createWmsMove(tx, tenantId, warehouseId, item, invoice, direction, operationType, baseQuantity) {
        const defaultLocation = await this.warehouseService.getOrCreateDefaultLocation(warehouseId);
        await tx.stockMove.create({
            data: {
                tenant: {
                    connect: {
                        id: tenantId
                    }
                },
                product: {
                    connect: {
                        id: item.productId
                    }
                },
                fromWarehouse: direction === _invoiceorchestratortypes.StockMovementDirection.OUT ? {
                    connect: {
                        id: warehouseId
                    }
                } : undefined,
                fromLocation: direction === _invoiceorchestratortypes.StockMovementDirection.OUT ? {
                    connect: {
                        id: defaultLocation.id
                    }
                } : undefined,
                toWarehouse: {
                    connect: {
                        id: warehouseId
                    }
                },
                toLocation: {
                    connect: {
                        id: defaultLocation.id
                    }
                },
                quantity: baseQuantity.toNumber(),
                moveType: direction === _invoiceorchestratortypes.StockMovementDirection.OUT ? 'SALE' : 'PUT_AWAY',
                refType: 'INVOICE',
                refId: invoice.id,
                notes: `${operationType === 'CANCEL' ? 'Cancelled' : 'Approved'} invoice ${invoice.invoiceNo}`
            }
        });
    }
    getDirectionFromMovementType(type) {
        switch(type){
            case _client.MovementType.ENTRY:
            case _client.MovementType.RETURN:
            case _client.MovementType.CANCELLATION_ENTRY:
            case _client.MovementType.COUNT_SURPLUS:
                return _invoiceorchestratortypes.StockMovementDirection.IN;
            case _client.MovementType.EXIT:
            case _client.MovementType.SALE:
            case _client.MovementType.CANCELLATION_EXIT:
            case _client.MovementType.COUNT_SHORTAGE:
                return _invoiceorchestratortypes.StockMovementDirection.OUT;
            default:
                // Varsayılan kural: ENTRY/RETURN/SURPLUS giriştir, diğerleri çıkıştır.
                return _invoiceorchestratortypes.StockMovementDirection.OUT;
        }
    }
    /**
     * Birim dönüşüm katsayısını kullanarak temel birim miktarını hesaplar.
     * (Eğer "1 Adet = 0.0833 Kutu" ise ve 1 Kutu satılıyorsa -> 1 / 0.0833 = 12 Adet)
     */ calculateBaseQuantity(item) {
        const qty = new _library.Decimal(item.quantity || 0);
        const selectedUnitName = item.unit;
        const product = item.product;
        if (!product || !product.unitRef || !product.unitRef.unitSet || !product.unitRef.unitSet.units) {
            return qty;
        }
        const units = product.unitRef.unitSet.units;
        const selectedUnit = units.find((u)=>u.name === selectedUnitName);
        if (!selectedUnit || selectedUnit.isBaseUnit) {
            return qty;
        }
        // Base Quantity = Qty / Rate (Mantık: 1 Adet = 0.0833 Kutu -> 1 Kutu = 1 / 0.0833 = 12 Adet)
        const rate = new _library.Decimal(selectedUnit.conversionRate || 1);
        if (rate.isZero()) return qty;
        // Decimal precision handling
        return qty.div(rate).toDecimalPlaces(4);
    }
    constructor(systemParameterService, warehouseService){
        this.systemParameterService = systemParameterService;
        this.warehouseService = warehouseService;
        this.logger = new _common.Logger(StockEffectService.name);
    }
};
StockEffectService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _systemparameterservice.SystemParameterService === "undefined" ? Object : _systemparameterservice.SystemParameterService,
        typeof _warehouseservice.WarehouseService === "undefined" ? Object : _warehouseservice.WarehouseService
    ])
], StockEffectService);

//# sourceMappingURL=stock-effect.service.js.map