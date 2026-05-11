"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _client = require("@prisma/client");
const _b2bfifoservice = require("../../b2b-portal/services/b2b-fifo.service");
const _b2badmincustomerservice = require("../services/b2b-admin-customer.service");
describe('B2bAdminCustomerService.getFifoPreview', ()=>{
    it('returns fifo summary for customer movements', async ()=>{
        const fifo = new _b2bfifoservice.B2BFifoService();
        const mockPrisma = {
            b2BCustomer: {
                findFirst: jest.fn().mockResolvedValue({
                    id: 'c1',
                    name: 'Test',
                    email: 't@x.com',
                    vatDays: 0
                })
            },
            b2BAccountMovement: {
                findMany: jest.fn().mockResolvedValue([
                    {
                        id: 'm1',
                        date: new Date('2024-01-01'),
                        type: _client.B2BMovementType.INVOICE,
                        debit: new _client.Prisma.Decimal(50),
                        credit: new _client.Prisma.Decimal(0)
                    }
                ])
            }
        };
        const mockFactory = {};
        const mockSync = {};
        const service = new _b2badmincustomerservice.B2bAdminCustomerService(mockPrisma, mockFactory, mockSync, fifo);
        const r = await service.getFifoPreview('t1', 'c1', new Date('2026-01-01'));
        expect(r.customer.id).toBe('c1');
        expect(r.summary.balance).toBe('50');
        expect(r.movements).toHaveLength(1);
        expect(r.movements[0].debit).toBe('50');
    });
});

//# sourceMappingURL=b2b-admin-customer-fifo.spec.js.map