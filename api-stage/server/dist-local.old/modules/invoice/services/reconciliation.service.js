"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReconciliationService", {
    enumerable: true,
    get: function() {
        return ReconciliationService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _prismaservice = require("../../../common/prisma.service");
const _library = require("@prisma/client/runtime/library");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ReconciliationService = class ReconciliationService {
    /**
     * Belirli bir faturanın stok ve cari hareketleri ile tutarlılığını kontrol eder.
     */ async verifyInvoiceConsistency(invoiceId, tenantId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: {
                id: invoiceId,
                tenantId
            },
            include: {
                items: true,
                accountMovements: {
                    where: {
                        isReversed: false,
                        deletedAt: null
                    }
                }
            }
        });
        if (!invoice) {
            throw new Error('Invoice not found');
        }
        const errors = [];
        const report = {
            invoiceId,
            isConsistent: true,
            errors: [],
            details: {
                invoiceTotal: new _library.Decimal(invoice.grandTotal),
                accountMovementAmount: new _library.Decimal(0),
                itemConsistency: []
            }
        };
        // 1. Durum Kontrolü
        if (invoice.status === _client.InvoiceStatus.OPEN || invoice.status === _client.InvoiceStatus.DRAFT) {
            // Açık faturaların hareketi olması beklenmez
            const hasAccountMovements = invoice.accountMovements.length > 0;
            if (hasAccountMovements) {
                errors.push('OPEN/DRAFT faturanın cari hareketi mevcut (Tutarsız)');
            }
            return {
                ...report,
                isConsistent: errors.length === 0,
                errors
            };
        }
        // 2. Cari Tutarlılık Kontrolü (APPROVED/CANCELLED için)
        const expectedCariAmount = new _library.Decimal(invoice.grandTotal);
        const actualCariAmount = invoice.accountMovements.reduce((acc, mov)=>acc.add(new _library.Decimal(mov.amount)), new _library.Decimal(0));
        report.details.accountMovementAmount = actualCariAmount;
        if (!expectedCariAmount.equals(actualCariAmount)) {
            errors.push(`Cari tutar tutarsız: Beklenen ${expectedCariAmount}, Gerçekleşen ${actualCariAmount}`);
        }
        // 3. Stok Tutarlılık Kontrolü (Kalem bazlı)
        for (const item of invoice.items){
            const movements = await this.prisma.productMovement.findMany({
                where: {
                    invoiceItemId: item.id,
                    isReversed: false,
                    deletedAt: null
                }
            });
            const totalMovedQty = movements.reduce((acc, mov)=>acc + Math.abs(mov.quantity), 0);
            const isConsistent = totalMovedQty === item.quantity;
            report.details.itemConsistency.push({
                productId: item.productId,
                invoiceQty: item.quantity,
                movementQty: totalMovedQty,
                isConsistent
            });
            if (!isConsistent) {
                errors.push(`Stok miktarı tutarsız: Ürün ${item.productId}, Fatura ${item.quantity}, Hareket ${totalMovedQty}`);
            }
        }
        report.isConsistent = errors.length === 0;
        report.errors = errors;
        // Mutabakat günlüğü yaz
        await this.prisma.reconciliationLog.create({
            data: {
                tenantId,
                invoiceId,
                checkType: 'INVOICE',
                isConsistent: report.isConsistent,
                discrepancyData: report.isConsistent ? null : report
            }
        });
        return report;
    }
    /**
     * Bir kiracının tüm onaylı faturalarını tarar ve mutabakat raporu oluşturur.
     */ async runFullTenantReconciliation(tenantId) {
        const approvedInvoices = await this.prisma.invoice.findMany({
            where: {
                tenantId,
                status: _client.InvoiceStatus.APPROVED,
                deletedAt: null
            },
            select: {
                id: true
            }
        });
        this.logger.log(`Starting full reconciliation for tenant ${tenantId}. Found ${approvedInvoices.length} invoices.`);
        let inconsistentCount = 0;
        for (const inv of approvedInvoices){
            const report = await this.verifyInvoiceConsistency(inv.id, tenantId);
            if (!report.isConsistent) inconsistentCount++;
        }
        return {
            totalChecked: approvedInvoices.length,
            inconsistentCount,
            scanFinishedAt: new Date()
        };
    }
    /**
     * Hatalı cari bakiyesini hareketlerden yola çıkarak onarır.
     * [!] Kritik İşlem: Sadece Admin veya Sistem yetkisiyle çalışmalıdır.
     */ async repairAccountBalance(accountId, tenantId) {
        const account = await this.prisma.account.findUnique({
            where: {
                id: accountId
            }
        });
        if (!account) throw new Error('Account not found');
        // Tüm (silinmemiş ve tersi alınmamış) hareketleri topla
        const movements = await this.prisma.accountMovement.findMany({
            where: {
                accountId,
                tenantId,
                deletedAt: null,
                isReversed: false
            }
        });
        let calculatedBalance = new _library.Decimal(0);
        for (const mov of movements){
            const exchangeRate = new _library.Decimal(1); // Normalde invoice/document üzerinden kur çekilmeli
            // Basitleştirilmiş: DEBIT (+), CREDIT (-)
            if (mov.type === _client.DebitCredit.DEBIT) {
                calculatedBalance = calculatedBalance.add(new _library.Decimal(mov.amount).mul(exchangeRate));
            } else {
                calculatedBalance = calculatedBalance.sub(new _library.Decimal(mov.amount).mul(exchangeRate));
            }
        }
        const previousBalance = new _library.Decimal(account.balance);
        if (!previousBalance.equals(calculatedBalance)) {
            await this.prisma.account.update({
                where: {
                    id: accountId
                },
                data: {
                    balance: calculatedBalance
                }
            });
            await this.prisma.reconciliationLog.create({
                data: {
                    tenantId,
                    accountId,
                    checkType: 'ACCOUNT',
                    isConsistent: false,
                    discrepancyData: {
                        previousBalance,
                        newBalance: calculatedBalance,
                        note: 'Balance repaired'
                    }
                }
            });
        }
        return {
            previousBalance,
            newBalance: calculatedBalance
        };
    }
    constructor(prisma){
        this.prisma = prisma;
        this.logger = new _common.Logger(ReconciliationService.name);
    }
};
ReconciliationService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], ReconciliationService);

//# sourceMappingURL=reconciliation.service.js.map