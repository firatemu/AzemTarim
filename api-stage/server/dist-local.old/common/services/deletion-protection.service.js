"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DeletionProtectionService", {
    enumerable: true,
    get: function() {
        return DeletionProtectionService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DeletionProtectionService = class DeletionProtectionService {
    /**
     * Cari kart silinebilir mi kontrol eder.
     * @param id Cari ID
     * @param tenantId Tenant ID
     * @throws BadRequestException Silinemezse hata fırlatır
     */ async checkCariDeletion(id, tenantId) {
        // 1. Hareket kontrolü
        const hareketSayisi = await this.prisma.accountMovement.count({
            where: {
                accountId: id,
                tenantId
            }
        });
        if (hareketSayisi > 0) {
            await this.logAttempt(id, 'Cari', tenantId, 'Hareket kayıtları bulunduğu için silme engellendi.');
            throw new _common.BadRequestException('Bu cari karta ait hareket kayıtları bulunduğu için silinemez. Lütfen pasife alınız.');
        }
        // 2. Invoice kontrolü
        const faturaSayisi = await this.prisma.invoice.count({
            where: {
                accountId: id,
                tenantId,
                deletedAt: null
            }
        });
        if (faturaSayisi > 0) {
            await this.logAttempt(id, 'Cari', tenantId, 'Invoice kayıtları bulunduğu için silme engellendi.');
            throw new _common.BadRequestException('Bu cari karta ait fatura kayıtları bulunduğu için silinemez. Lütfen pasife alınız.');
        }
        // 3. Collection kontrolü
        const tahsilatSayisi = await this.prisma.collection.count({
            where: {
                accountId: id,
                tenantId
            }
        });
        if (tahsilatSayisi > 0) {
            await this.logAttempt(id, 'Cari', tenantId, 'Collection/Ödeme kayıtları bulunduğu için silme engellendi.');
            throw new _common.BadRequestException('Bu cari karta ait tahsilat/ödeme kayıtları bulunduğu için silinemez. Lütfen pasife alınız.');
        }
        return true;
    }
    /**
     * Stok kart silinebilir mi kontrol eder.
     * @param id Stok ID
     * @param tenantId Tenant ID
     */ async checkStokDeletion(id, tenantId) {
        // 1. Stok hareketi
        const hareketSayisi = await this.prisma.productMovement.count({
            where: {
                productId: id,
                tenantId
            }
        });
        if (hareketSayisi > 0) {
            await this.logAttempt(id, 'Stok', tenantId, 'Stok hareketleri bulunduğu için silme engellendi.');
            throw new _common.BadRequestException('Bu product kartına ait hareketler bulunduğu için silinemez. Lütfen pasife alınız.');
        }
        // 2. Invoice itemsi
        const faturaKalemSayisi = await this.prisma.invoiceItem.count({
            where: {
                productId: id,
                invoice: {
                    tenantId,
                    deletedAt: null
                }
            }
        });
        if (faturaKalemSayisi > 0) {
            await this.logAttempt(id, 'Stok', tenantId, 'Invoice itemsinde kullanıldığı için silme engellendi.');
            throw new _common.BadRequestException('Bu product kartı faturalarda işlem gördüğü için silinemez. Lütfen pasife alınız.');
        }
        // 3. Stok transferleri/hareketleri (stock_moves)
        const stockMoveSayisi = await this.prisma.stockMove.count({
            where: {
                productId: id,
                product: {
                    tenantId
                }
            }
        });
        if (stockMoveSayisi > 0) {
            await this.logAttempt(id, 'Stok', tenantId, 'Depo hareketleri bulunduğu için silme engellendi.');
            throw new _common.BadRequestException('Bu product kartına ait depo hareketleri bulunduğu için silinemez. Lütfen pasife alınız.');
        }
        return true;
    }
    /**
     * Invoice silinebilir mi kontrol eder.
     * @param id Invoice ID
     * @param tenantId Tenant ID
     */ async checkFaturaDeletion(id, tenantId) {
        const fatura = await this.prisma.invoice.findUnique({
            where: {
                id
            },
            select: {
                status: true,
                tenantId: true
            }
        });
        if (!fatura || fatura.tenantId !== tenantId) {
            throw new _common.BadRequestException('Invoice bulunamadı.');
        }
        // 1. Onaylılık kontrolü
        if (fatura.status === 'APPROVED') {
            await this.logAttempt(id, 'Invoice', tenantId, 'Onaylı fatura silme denemesi engellendi.');
            throw new _common.BadRequestException('Onaylanmış (Kapatılmış) faturalar silinemez. Lütfen önce iptal ediniz veya statusunu değiştiriniz.');
        }
        // 2. Collection kontrolü (FaturaTahsilat tablosu)
        const tahsilatSayisi = await this.prisma.invoiceCollection.count({
            where: {
                invoiceId: id,
                tenantId
            }
        });
        if (tahsilatSayisi > 0) {
            await this.logAttempt(id, 'Invoice', tenantId, 'Collection kaydı olan fatura silme denemesi engellendi.');
            throw new _common.BadRequestException('Bu faturaya ait tahsilat kayıtları bulunduğu için silinemez. Lütfen önce collectionsı siliniz.');
        }
        return true;
    }
    /**
     * Silme girişimini günlüğe kaydeder.
     */ async logAttempt(resourceId, resource, tenantId, reason) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    action: 'DELETE_BLOCKED',
                    resource,
                    resourceId,
                    tenantId,
                    meta: {
                        reason
                    }
                }
            });
        } catch (error) {
            console.error('Deletion attempt log error:', error);
        }
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
DeletionProtectionService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], DeletionProtectionService);

//# sourceMappingURL=deletion-protection.service.js.map