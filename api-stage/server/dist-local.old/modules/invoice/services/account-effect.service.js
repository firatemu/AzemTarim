"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AccountEffectService", {
    enumerable: true,
    get: function() {
        return AccountEffectService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _library = require("@prisma/client/runtime/library");
const _movementtypehelper = require("../helpers/movement-type.helper");
const _invoiceorchestratortypes = require("../types/invoice-orchestrator.types");
const _systemparameterservice = require("../../system-parameter/system-parameter.service");
const _prismaservice = require("../../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AccountEffectService = class AccountEffectService {
    /**
     * Fatura onaylandığında veya iptal edildiğinde cari etkileri uygular.
     */ async applyAccountEffect(invoice, tx, operationType) {
        const tenantId = invoice.tenantId;
        // Cari risk kontrolü parametresini al
        const riskControlEnabled = await this.systemParameterService.getParameterAsBoolean('CARI_RISK_CONTROL', false);
        const { direction, balanceOp } = (0, _movementtypehelper.resolveAccountMovementDirection)(invoice.invoiceType, operationType);
        // TRY cinsinden tutarı hesapla
        const exchangeRate = new _library.Decimal(invoice.exchangeRate || 1);
        const amountTry = new _library.Decimal(invoice.grandTotal).mul(exchangeRate);
        // Hesabı bul ve kilitle (Pessimistic locking via select for update if possible, but Prisma doesn't support it directly in a clean way easily, increment/decrement is better)
        const account = await tx.account.findUnique({
            where: {
                id: invoice.accountId
            }
        });
        if (!account) {
            throw new _common.BadRequestException('Account not found');
        }
        // Risk kontrolü (Sadece onay anında ve borç (DEBIT) yönünde kontrol edilir)
        if (riskControlEnabled && operationType === 'APPROVE' && direction === _invoiceorchestratortypes.AccountMovementDirection.DEBIT) {
            const currentBalance = new _library.Decimal(account.balance);
            const limit = new _library.Decimal(account.creditLimit || 0);
            if (limit.gt(0) && currentBalance.add(amountTry).gt(limit)) {
                throw new _common.BadRequestException(`Credit limit exceeded for account: ${account.title}. Limit: ${limit}, Potential Balance: ${currentBalance.add(amountTry)}`);
            }
        }
        // Bakiyeyi güncelle
        const updatedAccount = await tx.account.update({
            where: {
                id: invoice.accountId
            },
            data: {
                balance: {
                    [balanceOp]: amountTry
                }
            }
        });
        // Cari hareket kaydı oluştur
        await tx.accountMovement.create({
            data: {
                tenant: {
                    connect: {
                        id: tenantId
                    }
                },
                account: {
                    connect: {
                        id: invoice.accountId
                    }
                },
                type: direction === _invoiceorchestratortypes.AccountMovementDirection.DEBIT ? _client.DebitCredit.DEBIT : _client.DebitCredit.CREDIT,
                amount: invoice.grandTotal,
                balance: updatedAccount.balance,
                documentType: _client.DocumentType.INVOICE,
                documentNo: invoice.invoiceNo,
                invoice: {
                    connect: {
                        id: invoice.id
                    }
                },
                notes: invoice.notes,
                recordType: operationType === 'CANCEL' ? 'CANCEL_REVERSAL' : 'NORMAL'
            }
        });
        return {
            accountId: invoice.accountId,
            amount: invoice.grandTotal,
            direction,
            invoiceId: invoice.id,
            documentType: 'INVOICE',
            documentNo: invoice.invoiceNo,
            date: invoice.date,
            tenantId
        };
    }
    /**
     * Mevcut cari etkileri tersine çevirir (UPDATE senaryosu için).
     */ async reverseAccountEffect(invoiceId, tenantId, tx, isDraftRevert = false) {
        // Faturaya ait henüz tersi alınmamış cari hareketleri bul
        const originalMovements = await tx.accountMovement.findMany({
            where: {
                invoiceId,
                tenantId,
                isReversed: false,
                deletedAt: null
            },
            include: {
                invoice: true
            }
        });
        if (originalMovements.length === 0) {
            return {
                stockMovementsReversed: 0,
                accountMovementReversed: false
            };
        }
        for (const mov of originalMovements){
            // Orijinal hareket yönünün tersini belirle
            const reverseType = mov.type === _client.DebitCredit.DEBIT ? _client.DebitCredit.CREDIT : _client.DebitCredit.DEBIT;
            const balanceOp = reverseType === _client.DebitCredit.DEBIT ? 'increment' : 'decrement';
            // Orijinal TRY tutarını hesapla (O anki kur ile)
            const exchangeRate = new _library.Decimal(mov.invoice?.exchangeRate || 1);
            const amountTry = new _library.Decimal(mov.amount).mul(exchangeRate);
            // Bakiyeyi geri al
            const updatedAccount = await tx.account.update({
                where: {
                    id: mov.accountId
                },
                data: {
                    balance: {
                        [balanceOp]: amountTry
                    }
                }
            });
            if (isDraftRevert) {
                // Taslağa dönüldüğünde ters kayıt atmak yerine orijinal hareketi soft-delete yap
                await tx.accountMovement.update({
                    where: {
                        id: mov.id
                    },
                    data: {
                        deletedAt: new Date()
                    }
                });
            } else {
                // İptal vb durumlarda Ters cari kayıt oluştur
                await tx.accountMovement.create({
                    data: {
                        tenant: {
                            connect: {
                                id: tenantId
                            }
                        },
                        account: {
                            connect: {
                                id: mov.accountId
                            }
                        },
                        type: reverseType,
                        amount: mov.amount,
                        balance: updatedAccount.balance,
                        documentType: mov.documentType,
                        documentNo: mov.documentNo,
                        invoice: mov.invoiceId ? {
                            connect: {
                                id: mov.invoiceId
                            }
                        } : undefined,
                        notes: `Reversal of movement ${mov.id}`,
                        isReversed: true,
                        reversalOf: {
                            connect: {
                                id: mov.id
                            }
                        },
                        isReversal: true,
                        recordType: 'UPDATE_REVERSAL'
                    }
                });
                // Orijinal kaydı tersi alınmış olarak işaretle
                await tx.accountMovement.update({
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
            stockMovementsReversed: 0,
            accountMovementReversed: true
        };
    }
    constructor(prisma, systemParameterService){
        this.prisma = prisma;
        this.systemParameterService = systemParameterService;
        this.logger = new _common.Logger(AccountEffectService.name);
    }
};
AccountEffectService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _systemparameterservice.SystemParameterService === "undefined" ? Object : _systemparameterservice.SystemParameterService
    ])
], AccountEffectService);

//# sourceMappingURL=account-effect.service.js.map