"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReminderTaskService", {
    enumerable: true,
    get: function() {
        return ReminderTaskService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _schedule = require("@nestjs/schedule");
const _prismaservice = require("../../common/prisma.service");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ReminderTaskService = class ReminderTaskService {
    async handleCron() {
        this.logger.log('Vade hatırlatma kontrolü başlıyor...');
        try {
            // 1. Aktif tenant'ları bul
            const tenants = await this.prisma.tenant.findMany({
                where: {
                    status: 'ACTIVE'
                },
                include: {
                    settings: true
                }
            });
            for (const tenant of tenants){
                await this.processTenantReminders(tenant);
            }
        } catch (error) {
            this.logger.error(`Vade hatırlatma işlemi sırasında hata: ${error.message}`);
        }
    }
    async processTenantReminders(tenant) {
        // 3 gün sonraki vadeyi hedefle
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 3);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        // Vadeleri yaklaşan çekleri bul
        const upcomingChecks = await this.prisma.checkBill.findMany({
            where: {
                tenantId: tenant.id,
                dueDate: {
                    gte: targetDate,
                    lt: nextDay
                },
                status: {
                    in: [
                        _client.CheckBillStatus.IN_PORTFOLIO,
                        _client.CheckBillStatus.IN_BANK_COLLECTION,
                        _client.CheckBillStatus.IN_BANK_GUARANTEE
                    ]
                },
                remainingAmount: {
                    gt: 0
                }
            },
            include: {
                account: true
            }
        });
        if (upcomingChecks.length === 0) return;
        // TODO: Email gönderimi yapılandırıldığında aktif edilecek
        // Tenant'ın adminlerini bul
        // const admins = await this.prisma.user.findMany({
        //     where: {
        //         tenantId: tenant.id,
        //         role: { in: ['ADMIN', 'TENANT_ADMIN', 'SUPER_ADMIN'] },
        //         isActive: true,
        //     },
        // });
        // for (const admin of admins) {
        //     await this.emailService.sendMaturityReminderEmail(
        //         admin.email,
        //         admin.fullName || admin.firstName || 'Sayın Kullanıcı',
        //         upcomingChecks
        //     );
        // }
        this.logger.log(`Tenant ${tenant.id} için ${upcomingChecks.length} adet evrak hatırlatması yapılacak.`);
    }
    async markOverdueAsUnpaid() {
        this.logger.log('Vadesi geçmiş DEBIT evraklar UNPAID olarak işaretleniyor...');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const result = await this.prisma.checkBill.updateMany({
                where: {
                    portfolioType: _client.PortfolioType.DEBIT,
                    status: _client.CheckBillStatus.IN_PORTFOLIO,
                    dueDate: {
                        lt: today
                    },
                    deletedAt: null,
                    tenantId: {
                        not: null
                    }
                },
                data: {
                    status: _client.CheckBillStatus.UNPAID
                }
            });
            this.logger.log(`${result.count} adet vadesi geçmiş evrak UNPAID olarak işaretlendi.`);
        } catch (error) {
            this.logger.error(`markOverdueAsUnpaid hatası: ${error.message}`);
        }
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
        this.logger = new _common.Logger(ReminderTaskService.name);
    }
};
_ts_decorate([
    (0, _schedule.Cron)(_schedule.CronExpression.EVERY_DAY_AT_9AM),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], ReminderTaskService.prototype, "handleCron", null);
_ts_decorate([
    (0, _schedule.Cron)('0 1 * * *'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], ReminderTaskService.prototype, "markOverdueAsUnpaid", null);
ReminderTaskService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], ReminderTaskService);

//# sourceMappingURL=reminder-task.service.js.map