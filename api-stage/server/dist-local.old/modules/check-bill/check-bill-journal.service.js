"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CheckBillJournalService", {
    enumerable: true,
    get: function() {
        return CheckBillJournalService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaservice = require("../../common/prisma.service");
const _stagingutil = require("../../common/utils/staging.util");
const _handlerregistry = require("./handlers/handler-registry");
const _accountbalanceservice = require("../account-balance/account-balance.service");
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
let CheckBillJournalService = class CheckBillJournalService {
    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const items = await this.prisma.checkBillJournal.findMany({
            where: {
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            },
            orderBy: {
                date: 'desc'
            },
            include: {
                account: {
                    select: {
                        title: true
                    }
                },
                items: {
                    include: {
                        checkBill: {
                            select: {
                                amount: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        items: true
                    }
                }
            }
        });
        return items.map((item)=>{
            const totalAmount = item.items.reduce((sum, bi)=>sum + Number(bi.checkBill.amount), 0);
            const { items: journalItems, _count, ...rest } = item;
            return {
                ...rest,
                totalAmount,
                documentCount: _count.items
            };
        });
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const item = await this.prisma.checkBillJournal.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            },
            include: {
                account: true,
                cashbox: true,
                bankAccount: true,
                items: {
                    include: {
                        checkBill: true
                    }
                }
            }
        });
        if (!item) return null;
        const checkBills = item.items.map((bi)=>bi.checkBill);
        const totalAmount = checkBills.reduce((sum, cs)=>sum + Number(cs.amount), 0);
        return {
            ...item,
            checkBills,
            totalAmount
        };
    }
    async create(dto, user) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) {
            throw new _common.BadRequestException('Kiracı bilgisi (tenantId) çözümlenemedi.');
        }
        const finalJournalNo = dto.journalNo?.trim() || await this.codeTemplateService.getNextCode(_codetemplateenums.ModuleType.CHECK_BILL_JOURNAL);
        // 1. Uniqueness guard — fail fast, transaction açılmadan önce
        const existing = await this.prisma.checkBillJournal.findFirst({
            where: {
                tenantId,
                journalNo: finalJournalNo
            }
        });
        if (existing) {
            throw new _common.ConflictException(`${finalJournalNo} bordro numarası zaten mevcut.`);
        }
        const result = await this.prisma.$transaction(async (tx)=>{
            // 2. Bordro başlığı oluştur
            const journal = await tx.checkBillJournal.create({
                data: {
                    tenantId,
                    journalNo: finalJournalNo,
                    type: dto.type,
                    date: new Date(dto.date),
                    accountId: dto.accountId,
                    bankAccountId: dto.bankAccountId,
                    cashboxId: dto.cashboxId,
                    notes: dto.notes,
                    createdById: user.id,
                    journalStatus: _client.CheckBillJournalPostingStatus.POSTED
                }
            });
            // 3. İlgili handler'ı seç
            const handler = this.handlerRegistry.resolve(dto.type);
            // 4. Handler varsa çalıştır
            if (handler) {
                await handler.handle(dto, {
                    tx,
                    journalId: journal.id,
                    tenantId,
                    performedById: user.id
                });
            } else {
                this.logger.warn(`[tenantId=${tenantId}] [userId=${user.id}] Handler bulunamadı: ${dto.type}. Bordro oluşturuldu ancak evrak işlemi yapılmadı.`);
            }
            return journal;
        });
        // İşlem sonrası bakiyeleri hesapla
        try {
            const items = await this.prisma.checkBillJournalItem.findMany({
                where: {
                    journalId: result.id,
                    tenantId
                },
                select: {
                    checkBillId: true
                }
            });
            const checkBillIds = items.map((i)=>i.checkBillId);
            if (checkBillIds.length > 0) {
                const movementAccounts = await this.prisma.$queryRawUnsafe(`SELECT DISTINCT account_id FROM account_movements WHERE check_bill_id = ANY($1) AND "tenantId" = $2`, checkBillIds, tenantId);
                const accountIds = movementAccounts.map((m)=>m.account_id);
                if (accountIds.length > 0) {
                    await this.accountBalanceService.recalculateMultipleBalances(accountIds);
                }
                // Numara şablonu sayaç güncelleme (başarılı kayıt sonrası)
                const checkBills = await this.prisma.checkBill.findMany({
                    where: {
                        id: {
                            in: checkBillIds
                        }
                    },
                    select: {
                        checkNo: true
                    }
                });
                for (const checkBill of checkBills){
                    if (checkBill.checkNo) {
                        this.codeTemplateService.saveLastCode(_codetemplateenums.ModuleType.CHECK_BILL_DOCUMENT, checkBill.checkNo).catch((err)=>{
                            this.logger.warn(`Numara şablonu sayaç güncellenirken hata: ${err.message}`);
                        });
                    }
                }
            }
        } catch (err) {
            this.logger.error(`Bakiye hesaplama hatası (Bordro ID: ${result.id}):`, err);
        }
        return result;
    }
    async update(id, dto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const journal = await this.prisma.checkBillJournal.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            }
        });
        if (!journal) throw new _common.NotFoundException('Bordro bulunamadı.');
        await this.prisma.checkBillJournal.update({
            where: {
                id
            },
            data: {
                ...dto.date && {
                    date: new Date(dto.date)
                },
                ...dto.notes !== undefined && {
                    notes: dto.notes
                }
            }
        });
        return this.findOne(id);
    }
    async remove(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const journal = await this.prisma.checkBillJournal.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                items: {
                    select: {
                        checkBillId: true
                    }
                }
            }
        });
        if (!journal) throw new _common.NotFoundException('Bordro bulunamadı.');
        if (journal.journalStatus === _client.CheckBillJournalPostingStatus.POSTED || journal.journalStatus === _client.CheckBillJournalPostingStatus.CANCELLED) {
            throw new _common.ConflictException('Bu bordro deftere işlenmiş veya iptal edilmiş; yalnızca taslak bordrolar silinebilir.');
        }
        const result = await this.prisma.$transaction(async (tx)=>{
            const checkBillIds = journal.items.map((i)=>i.checkBillId);
            let accountIdsToRecalculate = [];
            if (checkBillIds.length > 0) {
                // Hangi carilerin etkilendiğini bulalım (silinmeden önce)
                const movementAccounts = await tx.$queryRawUnsafe(`SELECT DISTINCT account_id FROM account_movements WHERE check_bill_id = ANY($1) AND "tenantId" = $2`, checkBillIds, tenantId);
                accountIdsToRecalculate = movementAccounts.map((m)=>m.account_id);
                // Bağlı evraklara soft delete uygula (sadece portföyde olanlar)
                await tx.checkBill.updateMany({
                    where: {
                        id: {
                            in: checkBillIds
                        },
                        status: 'IN_PORTFOLIO'
                    },
                    data: {
                        deletedAt: new Date()
                    }
                });
                // Cari hareketleri temizle
                await tx.$executeRawUnsafe(`DELETE FROM account_movements WHERE check_bill_id = ANY($1) AND "tenantId" = $2`, checkBillIds, tenantId);
            }
            // Bordroya soft delete uygula
            await tx.checkBillJournal.update({
                where: {
                    id
                },
                data: {
                    deletedAt: new Date()
                }
            });
            this.logger.log(`[tenantId=${tenantId}] Bordro ${id} silindi. Etkilenen evrak sayısı: ${checkBillIds.length}`);
            return {
                success: true,
                journalId: id,
                accountIdsToRecalculate
            };
        });
        // Silme işlemi sonrası bakiyeleri hesapla
        try {
            if (result.accountIdsToRecalculate.length > 0) {
                await this.accountBalanceService.recalculateMultipleBalances(result.accountIdsToRecalculate);
            }
        } catch (err) {
            this.logger.error(`Bakiye hesaplama hatası (Bordro Silme ID: ${id}):`, err);
        }
        return {
            success: result.success
        };
    }
    async findItems(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const journal = await this.prisma.checkBillJournal.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            },
            include: {
                items: {
                    include: {
                        checkBill: {
                            select: {
                                id: true,
                                checkNo: true,
                                amount: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });
        if (!journal) throw new _common.NotFoundException('Bordro bulunamadı.');
        return journal.items;
    }
    /** GL entegrasyonu tamamlanana kadar özet önizleme (doc §5.2) */ async glPreview(id) {
        const detail = await this.findOne(id);
        if (!detail) {
            throw new _common.NotFoundException('Bordro bulunamadı.');
        }
        const lines = (detail.checkBills || []).map((cb)=>({
                checkBillId: cb.id,
                debitAccountCode: '—',
                creditAccountCode: '—',
                amount: Number(cb.amount),
                description: `Çek/Senet ${cb.checkNo || cb.id}`
            }));
        return {
            journalId: id,
            type: detail.type,
            previewLines: lines,
            note: 'GLIntegrationService ile fişleştirilecek'
        };
    }
    async postJournal(id, userId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const j = await this.prisma.checkBillJournal.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            }
        });
        if (!j) throw new _common.NotFoundException('Bordro bulunamadı.');
        return this.prisma.checkBillJournal.update({
            where: {
                id
            },
            data: {
                journalStatus: _client.CheckBillJournalPostingStatus.POSTED,
                accountingDate: j.accountingDate ?? j.date,
                totalAmount: j.totalAmount ?? undefined,
                totalCount: j.totalCount ?? undefined,
                ...userId ? {
                    approvedById: userId,
                    approvedAt: new Date()
                } : {}
            }
        });
    }
    async approveJournal(id, userId) {
        if (!userId) throw new _common.BadRequestException('Kullanıcı bilgisi gerekli.');
        const tenantId = await this.tenantResolver.resolveForQuery();
        const j = await this.prisma.checkBillJournal.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            }
        });
        if (!j) throw new _common.NotFoundException('Bordro bulunamadı.');
        return this.prisma.checkBillJournal.update({
            where: {
                id
            },
            data: {
                approvedById: userId,
                approvedAt: new Date(),
                journalStatus: _client.CheckBillJournalPostingStatus.POSTED
            }
        });
    }
    async cancelJournal(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const j = await this.prisma.checkBillJournal.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
                deletedAt: null
            }
        });
        if (!j) throw new _common.NotFoundException('Bordro bulunamadı.');
        return this.prisma.checkBillJournal.update({
            where: {
                id
            },
            data: {
                journalStatus: _client.CheckBillJournalPostingStatus.CANCELLED
            }
        });
    }
    constructor(prisma, tenantResolver, handlerRegistry, accountBalanceService, codeTemplateService){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.handlerRegistry = handlerRegistry;
        this.accountBalanceService = accountBalanceService;
        this.codeTemplateService = codeTemplateService;
        this.logger = new _common.Logger(CheckBillJournalService.name);
    }
};
CheckBillJournalService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService,
        typeof _handlerregistry.HandlerRegistry === "undefined" ? Object : _handlerregistry.HandlerRegistry,
        typeof _accountbalanceservice.AccountBalanceService === "undefined" ? Object : _accountbalanceservice.AccountBalanceService,
        typeof _codetemplateservice.CodeTemplateService === "undefined" ? Object : _codetemplateservice.CodeTemplateService
    ])
], CheckBillJournalService);

//# sourceMappingURL=check-bill-journal.service.js.map