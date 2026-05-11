"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AccountBalanceService", {
    enumerable: true,
    get: function() {
        return AccountBalanceService;
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
let AccountBalanceService = class AccountBalanceService {
    /**
   * Belirli bir cari hesabının yürüyen bakiyesini hesaplar
   * @param accountId - Cari hesap ID'si
   * @param prisma - Transaction client (opsiyonel, transaction içinde kullanılıyorsa)
   * @returns Güncellenen bakiye ve hareket sayısı
   */ async recalculateAccountBalance(accountId, prisma) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const tx = prisma || this.prisma;
        // Hareketleri tarih ve oluşturulma zamanına göre sırala
        const movements = await tx.accountMovement.findMany({
            where: {
                accountId,
                deletedAt: null,
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
        if (movements.length === 0) {
            // Hareket yoksa bakiyeyi sıfırla
            await tx.account.updateMany({
                where: {
                    id: accountId,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
                },
                data: {
                    balance: 0
                }
            });
            return {
                balance: 0,
                movementsCount: 0
            };
        }
        // Yürüyen bakiye hesapla
        let runningBalance = 0;
        const movementUpdates = movements.map((movement)=>{
            const amount = Number(movement.amount);
            if (movement.type === 'DEBIT') {
                runningBalance += amount; // Borç (alacağımız var)
            } else {
                runningBalance -= amount; // Alacak (borçumuz var)
            }
            return {
                where: {
                    id: movement.id
                },
                data: {
                    balance: runningBalance
                }
            };
        });
        // Tüm hareketlerin balance alanını güncelle
        for (const update of movementUpdates){
            await tx.accountMovement.update(update);
        }
        // Cari kartının ana bakiye alanını güncelle
        await tx.account.updateMany({
            where: {
                id: accountId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            data: {
                balance: runningBalance
            }
        });
        return {
            balance: runningBalance,
            movementsCount: movements.length
        };
    }
    /**
   * Tüm cari hesaplarının yürüyen bakiyesini hesaplar
   * @param prisma - Transaction client (opsiyonel)
   * @returns Hesaplanan cari sayısı
   */ async recalculateAllBalances(prisma) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const tx = prisma || this.prisma;
        const accounts = await tx.account.findMany({
            where: {
                deletedAt: null,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            select: {
                id: true
            }
        });
        let processedCount = 0;
        for (const account of accounts){
            await this.recalculateAccountBalance(account.id, tx);
            processedCount++;
        }
        return {
            processedCount,
            totalAccounts: accounts.length
        };
    }
    /**
   * Birden fazla cari hesabının yürüyen bakiyesini hesaplar
   * @param accountIds - Cari hesap ID'leri
   * @param prisma - Transaction client (opsiyonel)
   * @returns Hesaplanan cari sayısı
   */ async recalculateMultipleBalances(accountIds, prisma) {
        const tx = prisma || this.prisma;
        let processedCount = 0;
        for (const accountId of accountIds){
            await this.recalculateAccountBalance(accountId, tx);
            processedCount++;
        }
        return {
            processedCount,
            totalAccounts: accountIds.length
        };
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
AccountBalanceService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], AccountBalanceService);

//# sourceMappingURL=account-balance.service.js.map