"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _client = require("@prisma/client");
const _b2bfifoservice = require("../b2b-fifo.service");
function addDays(d, days) {
    const x = new Date(d.getTime());
    x.setDate(x.getDate() + days);
    return x;
}
describe('B2BFifoService', ()=>{
    let service;
    beforeEach(()=>{
        service = new _b2bfifoservice.B2BFifoService();
    });
    it('empty movements: zero summary', ()=>{
        const r = service.calculateFifo([], 30, new Date('2025-06-15'));
        expect(r.summary.totalDebit.toString()).toBe('0');
        expect(r.summary.totalCredit.toString()).toBe('0');
        expect(r.summary.balance.toString()).toBe('0');
        expect(r.summary.overdueAmount.toString()).toBe('0');
        expect(r.summary.oldestOverdueDate).toBeNull();
        expect(r.movements).toEqual([]);
    });
    it('invoice only: remaining equals debit; past due when asOf after due', ()=>{
        const invDate = new Date('2025-01-01');
        const asOf = new Date('2025-02-15'); // > 30 days
        const r = service.calculateFifo([
            {
                id: 'inv1',
                date: invDate,
                type: _client.B2BMovementType.INVOICE,
                debit: 100,
                credit: 0
            }
        ], 30, asOf);
        const row = r.movements[0];
        expect(row.remainingInvoiceDebit?.toString()).toBe('100');
        expect(row.isPastDue).toBe(true);
        expect(r.summary.overdueAmount.toString()).toBe('100');
        expect(r.summary.oldestOverdueDate?.getTime()).toBe(addDays(invDate, 30).getTime());
    });
    it('full payment closes invoice: not past due', ()=>{
        const invDate = new Date('2025-01-01');
        const payDate = new Date('2025-01-10');
        const asOf = new Date('2025-02-15');
        const r = service.calculateFifo([
            {
                id: 'inv1',
                date: invDate,
                type: _client.B2BMovementType.INVOICE,
                debit: 100,
                credit: 0
            },
            {
                id: 'pay1',
                date: payDate,
                type: _client.B2BMovementType.PAYMENT,
                debit: 0,
                credit: 100
            }
        ], 30, asOf);
        const invRow = r.movements.find((m)=>m.id === 'inv1');
        expect(invRow?.remainingInvoiceDebit?.toString()).toBe('0');
        expect(invRow?.isPastDue).toBe(false);
        expect(r.summary.overdueAmount.toString()).toBe('0');
        expect(r.summary.balance.toString()).toBe('0');
    });
    it('partial payment: FIFO leaves remainder on oldest invoice', ()=>{
        const r = service.calculateFifo([
            {
                id: 'inv1',
                date: new Date('2025-01-01'),
                type: _client.B2BMovementType.INVOICE,
                debit: 60,
                credit: 0
            },
            {
                id: 'inv2',
                date: new Date('2025-01-05'),
                type: _client.B2BMovementType.INVOICE,
                debit: 40,
                credit: 0
            },
            {
                id: 'pay1',
                date: new Date('2025-01-08'),
                type: _client.B2BMovementType.PAYMENT,
                debit: 0,
                credit: 50
            }
        ], 0, new Date('2025-01-20'));
        const inv1 = r.movements.find((m)=>m.id === 'inv1');
        const inv2 = r.movements.find((m)=>m.id === 'inv2');
        expect(inv1?.remainingInvoiceDebit?.toString()).toBe('10');
        expect(inv2?.remainingInvoiceDebit?.toString()).toBe('40');
        expect(r.summary.balance.toString()).toBe('50');
    });
    it('payment before invoice in array still applies FIFO by date sort', ()=>{
        const r = service.calculateFifo([
            {
                id: 'pay1',
                date: new Date('2025-01-20'),
                type: _client.B2BMovementType.PAYMENT,
                debit: 0,
                credit: 30
            },
            {
                id: 'inv1',
                date: new Date('2025-01-01'),
                type: _client.B2BMovementType.INVOICE,
                debit: 100,
                credit: 0
            }
        ], 0, new Date('2025-02-01'));
        expect(r.movements.find((m)=>m.id === 'inv1')?.remainingInvoiceDebit?.toString()).toBe('70');
    });
    it('uses Prisma.Decimal amounts', ()=>{
        const r = service.calculateFifo([
            {
                id: 'inv1',
                date: new Date('2025-01-01'),
                type: _client.B2BMovementType.INVOICE,
                debit: new _client.Prisma.Decimal('99.99'),
                credit: 0
            }
        ], 10, new Date('2099-01-01'));
        expect(r.summary.totalDebit.toString()).toBe('99.99');
    });
    it('invoice with future due date: not past due', ()=>{
        const invDate = new Date('2025-06-01');
        const asOf = new Date('2025-06-10'); // Only 9 days later, less than 30 day vatDays
        const r = service.calculateFifo([
            {
                id: 'inv1',
                date: invDate,
                type: _client.B2BMovementType.INVOICE,
                debit: 100,
                credit: 0
            }
        ], 30, asOf);
        const row = r.movements[0];
        expect(row.remainingInvoiceDebit?.toString()).toBe('100');
        expect(row.isPastDue).toBe(false);
        expect(r.summary.overdueAmount.toString()).toBe('0');
        expect(r.summary.oldestOverdueDate).toBeNull();
    });
    it('payment larger than first invoice: remainder applied to second invoice', ()=>{
        const r = service.calculateFifo([
            {
                id: 'inv1',
                date: new Date('2025-01-01'),
                type: _client.B2BMovementType.INVOICE,
                debit: 50,
                credit: 0
            },
            {
                id: 'inv2',
                date: new Date('2025-01-05'),
                type: _client.B2BMovementType.INVOICE,
                debit: 60,
                credit: 0
            },
            {
                id: 'pay1',
                date: new Date('2025-01-10'),
                type: _client.B2BMovementType.PAYMENT,
                debit: 0,
                credit: 80
            }
        ], 0, new Date('2025-01-20'));
        const inv1 = r.movements.find((m)=>m.id === 'inv1');
        const inv2 = r.movements.find((m)=>m.id === 'inv2');
        expect(inv1?.remainingInvoiceDebit?.toString()).toBe('0'); // Fully paid
        expect(inv2?.remainingInvoiceDebit?.toString()).toBe('30'); // 60 - 30 remainder
        expect(r.summary.balance.toString()).toBe('30');
    });
    it('all invoices fully paid: overdueAmount is 0', ()=>{
        const r = service.calculateFifo([
            {
                id: 'inv1',
                date: new Date('2025-01-01'),
                type: _client.B2BMovementType.INVOICE,
                debit: 100,
                credit: 0
            },
            {
                id: 'inv2',
                date: new Date('2025-01-05'),
                type: _client.B2BMovementType.INVOICE,
                debit: 75,
                credit: 0
            },
            {
                id: 'pay1',
                date: new Date('2025-01-10'),
                type: _client.B2BMovementType.PAYMENT,
                debit: 0,
                credit: 100
            },
            {
                id: 'pay2',
                date: new Date('2025-01-15'),
                type: _client.B2BMovementType.PAYMENT,
                debit: 0,
                credit: 75
            }
        ], 30, new Date('2025-03-01'));
        expect(r.summary.overdueAmount.toString()).toBe('0');
        expect(r.summary.balance.toString()).toBe('0');
        expect(r.summary.oldestOverdueDate).toBeNull();
    });
    it('partial payment with overdue: correct overdue amount calculation', ()=>{
        const invDate = new Date('2025-01-01');
        const payDate = new Date('2025-02-15'); // After due date
        const asOf = new Date('2025-03-01');
        const r = service.calculateFifo([
            {
                id: 'inv1',
                date: invDate,
                type: _client.B2BMovementType.INVOICE,
                debit: 100,
                credit: 0
            },
            {
                id: 'pay1',
                date: payDate,
                type: _client.B2BMovementType.PAYMENT,
                debit: 0,
                credit: 30
            }
        ], 30, asOf);
        const invRow = r.movements.find((m)=>m.id === 'inv1');
        expect(invRow?.remainingInvoiceDebit?.toString()).toBe('70');
        expect(invRow?.isPastDue).toBe(true);
        expect(r.summary.overdueAmount.toString()).toBe('70');
    });
});

//# sourceMappingURL=b2b-fifo.service.spec.js.map