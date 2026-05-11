"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvoiceOrchestratorService", {
    enumerable: true,
    get: function() {
        return InvoiceOrchestratorService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaservice = require("../../../common/prisma.service");
const _stockeffectservice = require("./stock-effect.service");
const _accounteffectservice = require("./account-effect.service");
const _bullmq = require("@nestjs/bullmq");
const _bullmq1 = require("bullmq");
const _invoiceenums = require("../invoice.enums");
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
let InvoiceOrchestratorService = class InvoiceOrchestratorService {
    /**
     * Faturayı onaylar ve etkilerini (stok/cari) uygular.
     */ async approveInvoice(invoiceId, context) {
        const invoice = await this.prisma.invoice.findUnique({
            where: {
                id: invoiceId,
                tenantId: context.tenantId
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                unitRef: {
                                    include: {
                                        unitSet: {
                                            include: {
                                                units: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                account: true
            }
        });
        if (!invoice) throw new _common.BadRequestException('Invoice not found');
        if (invoice.status === _client.InvoiceStatus.APPROVED) {
            this.logger.log(`Invoice ${invoiceId} is already approved. Skipping.`);
            return;
        }
        try {
            await this.prisma.$transaction(async (tx)=>{
                // 1. Stok etkilerini uygula
                await this.stockEffectService.applyStockEffects(invoice, tx, 'APPROVE');
                // 2. Cari etkilerini uygula
                await this.accountEffectService.applyAccountEffect(invoice, tx, 'APPROVE');
                // 3. Fatura durumunu güncelle
                await tx.invoice.update({
                    where: {
                        id: invoiceId
                    },
                    data: {
                        status: _client.InvoiceStatus.APPROVED,
                        updatedBy: context.userId
                    }
                });
                // 4. Log yaz
                await tx.invoiceLog.create({
                    data: {
                        tenantId: context.tenantId,
                        invoiceId,
                        userId: context.userId,
                        actionType: 'APPROVE',
                        changes: JSON.stringify({
                            previousStatus: invoice.status,
                            newStatus: _client.InvoiceStatus.APPROVED
                        })
                    }
                });
            });
            // İşlem sonrası asenkron görevleri kuyruğa ekle
            await this.addPostProcessingJobs(invoiceId, context.tenantId);
        } catch (error) {
            this.logger.error(`Approval failed for invoice ${invoiceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Faturayı iptal eder ve etkilerini (stok/cari) tersine çevirir.
     */ async cancelInvoice(invoiceId, context, reason) {
        const invoice = await this.prisma.invoice.findUnique({
            where: {
                id: invoiceId,
                tenantId: context.tenantId
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                unitRef: {
                                    include: {
                                        unitSet: {
                                            include: {
                                                units: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                account: true
            }
        });
        if (!invoice) throw new _common.BadRequestException('Invoice not found');
        if (invoice.status === _client.InvoiceStatus.CANCELLED) {
            this.logger.log(`Invoice ${invoiceId} is already cancelled. Skipping.`);
            return;
        }
        // İş kuralı: Sadece APPROVED faturaların etkileri (stok/cari) ters çevrilir.
        // OPEN faturanın etkisi henüz yoktur.
        const hasEffects = invoice.status === _client.InvoiceStatus.APPROVED;
        try {
            await this.prisma.$transaction(async (tx)=>{
                if (hasEffects) {
                    // Cari etkisi her zaman ters çevrilir (CANCEL yönde kayıt atılır)
                    await this.accountEffectService.applyAccountEffect(invoice, tx, 'CANCEL');
                    // Stok etkisi: SADECE iade faturalarında (IADE) ters kayıt (stok düzeltme) yapılır.
                    // SATIS/ALIS faturalarında iptal anında stok hareketi oluşmaz (ERP kuralı).
                    const isReturnInvoice = [
                        _invoiceenums.InvoiceType.SALES_RETURN,
                        _invoiceenums.InvoiceType.PURCHASE_RETURN
                    ].includes(invoice.invoiceType);
                    if (isReturnInvoice) {
                        await this.stockEffectService.applyStockEffects(invoice, tx, 'CANCEL');
                    }
                }
                // Fatura durumunu güncelle
                await tx.invoice.update({
                    where: {
                        id: invoiceId
                    },
                    data: {
                        status: _client.InvoiceStatus.CANCELLED,
                        updatedBy: context.userId,
                        notes: reason ? `${invoice.notes || ''}\nİptal Nedeni: ${reason}` : invoice.notes
                    }
                });
                await tx.invoiceLog.create({
                    data: {
                        tenantId: context.tenantId,
                        invoiceId,
                        userId: context.userId,
                        actionType: 'CANCEL',
                        changes: JSON.stringify({
                            reason
                        })
                    }
                });
            });
            if (hasEffects) {
                await this.addPostProcessingJobs(invoiceId, context.tenantId);
            }
        } catch (error) {
            this.logger.error(`Cancellation failed for invoice ${invoiceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Fatura kalemleri güncellendiğinde etkileri senkronize eder.
     */ async updateInvoiceItems(invoiceId, context) {
        const tenantId = context.tenantId;
        try {
            await this.prisma.$transaction(async (tx)=>{
                // 1. Mevcut stok etkilerini geri al (Reverse)
                await this.stockEffectService.reverseStockEffects(invoiceId, tenantId, tx);
                // 2. Mevcut cari etkilerini geri al (Reverse)
                await this.accountEffectService.reverseAccountEffect(invoiceId, tenantId, tx);
                // 3. Güncel fatura verisini al (Yeniden yükle)
                const updatedInvoice = await tx.invoice.findUnique({
                    where: {
                        id: invoiceId,
                        tenantId
                    },
                    include: {
                        items: {
                            include: {
                                product: {
                                    include: {
                                        unitRef: {
                                            include: {
                                                unitSet: {
                                                    include: {
                                                        units: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        account: true
                    }
                });
                if (!updatedInvoice) throw new Error('Invoice vanished during transaction');
                // 4. Yeni etkileri uygula (APPROVED ise)
                if (updatedInvoice.status === _client.InvoiceStatus.APPROVED) {
                    await this.stockEffectService.applyStockEffects(updatedInvoice, tx, 'APPROVE');
                    await this.accountEffectService.applyAccountEffect(updatedInvoice, tx, 'APPROVE');
                }
            });
            await this.addPostProcessingJobs(invoiceId, tenantId);
        } catch (error) {
            this.logger.error(`Syncing effects failed for invoice ${invoiceId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    /**
     * Kuyruklara iş ekler (Maliyet hesaplama ve mutabakat).
     */ async addPostProcessingJobs(invoiceId, tenantId) {
        await this.effectsQueue.add('COSTING_RECALCULATE', {
            invoiceId,
            tenantId
        }, {
            removeOnComplete: true,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000
            }
        });
        await this.effectsQueue.add('RECONCILIATION_CHECK', {
            invoiceId,
            tenantId
        }, {
            removeOnComplete: true,
            delay: 10000 // Veritabanı tutarlılığını biraz bekleyip kontrol et
        });
    }
    constructor(prisma, stockEffectService, accountEffectService, effectsQueue){
        this.prisma = prisma;
        this.stockEffectService = stockEffectService;
        this.accountEffectService = accountEffectService;
        this.effectsQueue = effectsQueue;
        this.logger = new _common.Logger(InvoiceOrchestratorService.name);
    }
};
InvoiceOrchestratorService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(3, (0, _bullmq.InjectQueue)('invoice-effects')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _stockeffectservice.StockEffectService === "undefined" ? Object : _stockeffectservice.StockEffectService,
        typeof _accounteffectservice.AccountEffectService === "undefined" ? Object : _accounteffectservice.AccountEffectService,
        typeof _bullmq1.Queue === "undefined" ? Object : _bullmq1.Queue
    ])
], InvoiceOrchestratorService);

//# sourceMappingURL=invoice-orchestrator.service.js.map