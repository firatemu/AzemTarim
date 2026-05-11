"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _client = require("@prisma/client");
const _b2baccountservice = require("../b2b-account.service");
const _b2bfifoservice = require("../b2b-fifo.service");
describe('B2bAccountService', ()=>{
    let service;
    let mockPrisma;
    let mockRisk;
    let mockCart;
    let fifo;
    beforeEach(()=>{
        fifo = new _b2bfifoservice.B2BFifoService();
        mockRisk = {
            assertOrderAllowed: jest.fn().mockResolvedValue(undefined)
        };
        mockCart = {
            getCartSummary: jest.fn().mockResolvedValue({
                items: [],
                totals: {
                    totalFinalPrice: new _client.Prisma.Decimal(0)
                }
            })
        };
        mockPrisma = {
            b2BCustomer: {
                findFirst: jest.fn()
            },
            account: {
                findFirst: jest.fn()
            },
            b2BAccountMovement: {
                aggregate: jest.fn(),
                findMany: jest.fn(),
                count: jest.fn()
            },
            b2BOrder: {
                count: jest.fn()
            },
            $transaction: jest.fn()
        };
        service = new _b2baccountservice.B2bAccountService(mockPrisma, mockRisk, mockCart, fifo);
    });
    describe('getSummary', ()=>{
        it('includes fifo summary from movements and vatDays', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
                id: 'c1',
                name: 'A',
                email: 'a@x.com',
                vatDays: 0,
                erpAccountId: 'erp1'
            });
            mockPrisma.account.findFirst.mockResolvedValue({
                balance: new _client.Prisma.Decimal(0),
                creditLimit: null,
                creditStatus: null,
                title: 'Cari'
            });
            mockPrisma.b2BAccountMovement.aggregate.mockResolvedValue({
                _count: 0,
                _sum: {
                    debit: null,
                    credit: null
                }
            });
            mockPrisma.b2BAccountMovement.findMany.mockResolvedValue([
                {
                    id: 'm1',
                    date: new Date('2025-01-01'),
                    type: _client.B2BMovementType.INVOICE,
                    debit: new _client.Prisma.Decimal(100),
                    credit: new _client.Prisma.Decimal(0)
                }
            ]);
            mockPrisma.b2BOrder.count.mockResolvedValue(0);
            const r = await service.getSummary('t1', 'c1');
            expect(r.fifo.balance).toBe('100');
            expect(r.fifo.pastDueMovementCount).toBe(1);
            expect(mockPrisma.b2BAccountMovement.findMany).toHaveBeenCalled();
        });
    });
    describe('exportMovementsXlsx', ()=>{
        it('builds xlsx buffer with fifo columns', async ()=>{
            const fifo = new _b2bfifoservice.B2BFifoService();
            mockPrisma.b2BAccountMovement.findMany.mockResolvedValueOnce([
                {
                    id: 'm1',
                    date: new Date('2025-01-01'),
                    type: _client.B2BMovementType.INVOICE,
                    description: null,
                    debit: new _client.Prisma.Decimal(10),
                    credit: new _client.Prisma.Decimal(0),
                    balance: new _client.Prisma.Decimal(10),
                    erpMovementId: 'e1',
                    tenantId: 't1',
                    customerId: 'c1',
                    erpInvoiceNo: null,
                    dueDate: null,
                    isPastDue: false,
                    createdAt: new Date()
                }
            ]).mockResolvedValueOnce([
                {
                    id: 'm1',
                    date: new Date('2025-01-01'),
                    type: _client.B2BMovementType.INVOICE,
                    debit: new _client.Prisma.Decimal(10),
                    credit: new _client.Prisma.Decimal(0)
                }
            ]);
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
                vatDays: 0
            });
            const buf = await service.exportMovementsXlsx('t1', 'c1', {
                maxRows: 100
            });
            expect(Buffer.isBuffer(buf)).toBe(true);
            expect(buf.length).toBeGreaterThan(100);
            expect(mockPrisma.b2BAccountMovement.findMany).toHaveBeenCalled();
        });
    });
    describe('listMovements', ()=>{
        it('with includeFifo merges fifo fields', async ()=>{
            mockPrisma.$transaction.mockImplementation((ops)=>Promise.all(ops));
            mockPrisma.b2BAccountMovement.count.mockResolvedValue(1);
            const fullRow = {
                id: 'm1',
                date: new Date('2025-01-01'),
                type: _client.B2BMovementType.INVOICE,
                debit: new _client.Prisma.Decimal(100),
                credit: new _client.Prisma.Decimal(0),
                balance: new _client.Prisma.Decimal(100),
                erpMovementId: 'e1',
                tenantId: 't1',
                customerId: 'c1',
                description: null,
                erpInvoiceNo: null,
                dueDate: null,
                isPastDue: false,
                createdAt: new Date()
            };
            mockPrisma.b2BAccountMovement.findMany.mockResolvedValueOnce([
                fullRow
            ]).mockResolvedValueOnce([
                {
                    id: 'm1',
                    date: new Date('2025-01-01'),
                    type: _client.B2BMovementType.INVOICE,
                    debit: new _client.Prisma.Decimal(100),
                    credit: new _client.Prisma.Decimal(0)
                }
            ]);
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue({
                vatDays: 0
            });
            const r = await service.listMovements('t1', 'c1', {
                page: 1,
                pageSize: 25,
                includeFifo: true
            });
            const row = r.data[0];
            expect(row).toMatchObject({
                id: 'm1',
                fifoIsPastDue: true,
                fifoRemainingDebit: '100'
            });
        });
    });
});

//# sourceMappingURL=b2b-account.service.spec.js.map