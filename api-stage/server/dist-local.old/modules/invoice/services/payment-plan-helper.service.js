"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentPlanHelperService", {
    enumerable: true,
    get: function() {
        return PaymentPlanHelperService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../../common/prisma.service");
const _stagingutil = require("../../../common/utils/staging.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PaymentPlanHelperService = class PaymentPlanHelperService {
    /**
   * Fatura için ödeme planı taksitlerini günceller
   * FIFO mantığıyla: vade tarihi eski olan taksitten başlar
   *
   * @param invoiceId Fatura ID
   * @param paymentAmount Ödenen tutar
   * @param tenantId Tenant ID
   * @param prisma Transaction client (opsiyonel)
   * @returns Güncelleme sonuçları
   */ async markInstallmentsAsPaid(invoiceId, paymentAmount, tenantId, prisma) {
        const tx = prisma || this.prisma;
        // Ödenmemiş taksitleri getir (vade tarihine göre sıralı - FIFO)
        const paymentPlans = await tx.invoicePaymentPlan.findMany({
            where: {
                invoiceId,
                isPaid: false,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            orderBy: {
                dueDate: 'asc'
            }
        });
        if (paymentPlans.length === 0) {
            // Ödeme planı yok, işlem yapma
            return {
                markedCount: 0,
                remainingAmount: paymentAmount,
                totalAmount: paymentAmount
            };
        }
        let remainingAmount = paymentAmount;
        let markedCount = 0;
        for (const plan of paymentPlans){
            if (remainingAmount <= 0.01) break; // 1 kuruş tolerans
            const planAmount = Number(plan.amount);
            // Taksit tamamen ödenebiliyor
            if (remainingAmount >= planAmount - 0.01) {
                await tx.invoicePaymentPlan.update({
                    where: {
                        id: plan.id
                    },
                    data: {
                        isPaid: true
                    }
                });
                remainingAmount -= planAmount;
                markedCount++;
            } else {
                break;
            }
        }
        // Kalan tutarı sonraki taksitten düş (kısmi ödeme senaryosu)
        if (remainingAmount > 0.01 && paymentPlans.length > markedCount) {
        // Kalan tutarı bir sonraki taksitin amount'ından çıkar
        // Bu kısım ileriki bir sürümde eklenebilir
        // Şimdilik kalan tutar bos gider
        }
        return {
            markedCount,
            remainingAmount,
            totalAmount: paymentAmount
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
PaymentPlanHelperService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], PaymentPlanHelperService);

//# sourceMappingURL=payment-plan-helper.service.js.map