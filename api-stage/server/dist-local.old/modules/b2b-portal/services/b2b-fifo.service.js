"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2BFifoService", {
    enumerable: true,
    get: function() {
        return B2BFifoService;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let B2BFifoService = class B2BFifoService {
    toDec(v) {
        return v instanceof _client.Prisma.Decimal ? v : new _client.Prisma.Decimal(v);
    }
    addDays(d, days) {
        const x = new Date(d.getTime());
        x.setDate(x.getDate() + days);
        return x;
    }
    /** Gun bazinda: a gunu, b gununden once mi (saat normalize) */ isDateBefore(a, b) {
        const da = new Date(a);
        da.setHours(0, 0, 0, 0);
        const db = new Date(b);
        db.setHours(0, 0, 0, 0);
        return da.getTime() < db.getTime();
    }
    /**
   * Fatura borclarini (INVOICE, debit>0) FIFO ile odemeler/alislar (credit>0) kapatir.
   * Vade: fatura tarihi + vatDays. Kismi kapali fatura vadesi gecmisse isPastDue.
   */ calculateFifo(movements, vatDays, asOf = new Date()) {
        const sorted = [
            ...movements
        ].sort((a, b)=>{
            const t = a.date.getTime() - b.date.getTime();
            return t !== 0 ? t : a.id.localeCompare(b.id);
        });
        let totalDebit = new _client.Prisma.Decimal(0);
        let totalCredit = new _client.Prisma.Decimal(0);
        const queue = [];
        for (const m of sorted){
            const dr = this.toDec(m.debit);
            const cr = this.toDec(m.credit);
            totalDebit = totalDebit.add(dr);
            totalCredit = totalCredit.add(cr);
            if (m.type === _client.B2BMovementType.INVOICE && dr.gt(0)) {
                queue.push({
                    movementId: m.id,
                    dueDate: this.addDays(m.date, vatDays),
                    remaining: dr
                });
            }
            if (cr.gt(0)) {
                let pay = cr;
                for (const inv of queue){
                    if (pay.lte(0)) break;
                    if (inv.remaining.lte(0)) continue;
                    const take = inv.remaining.lt(pay) ? inv.remaining : pay;
                    inv.remaining = inv.remaining.sub(take);
                    pay = pay.sub(take);
                }
            }
        }
        const remainingById = new Map();
        for (const inv of queue){
            remainingById.set(inv.movementId, inv.remaining);
        }
        let overdueAmount = new _client.Prisma.Decimal(0);
        let oldestOverdueDate = null;
        const rows = movements.map((m)=>{
            const dr = this.toDec(m.debit);
            const cr = this.toDec(m.credit);
            const base = {
                ...m,
                isPastDue: false
            };
            if (m.type === _client.B2BMovementType.INVOICE && dr.gt(0)) {
                const dueDate = this.addDays(m.date, vatDays);
                const rem = remainingById.get(m.id) ?? new _client.Prisma.Decimal(0);
                const past = rem.gt(0) && this.isDateBefore(dueDate, asOf);
                base.dueDate = dueDate;
                base.remainingInvoiceDebit = rem;
                base.isPastDue = past;
                if (past) {
                    overdueAmount = overdueAmount.add(rem);
                    if (!oldestOverdueDate || dueDate < oldestOverdueDate) {
                        oldestOverdueDate = dueDate;
                    }
                }
            }
            return base;
        });
        const balance = totalDebit.sub(totalCredit);
        return {
            movements: rows,
            summary: {
                totalDebit,
                totalCredit,
                balance,
                overdueAmount,
                oldestOverdueDate
            }
        };
    }
};
B2BFifoService = _ts_decorate([
    (0, _common.Injectable)()
], B2BFifoService);

//# sourceMappingURL=b2b-fifo.service.js.map