"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _accounteffectservice = require("../account-effect.service");
const _invoiceenums = require("../../invoice.enums");
const _library = require("@prisma/client/runtime/library");
describe('AccountEffectService', ()=>{
    let service;
    let mockPrisma;
    let mockSystemParams;
    beforeEach(()=>{
        mockPrisma = {
            account: {
                findUnique: jest.fn(),
                update: jest.fn()
            },
            accountMovement: {
                create: jest.fn()
            }
        };
        mockSystemParams = {
            getParameterAsBoolean: jest.fn().mockResolvedValue(true)
        };
        service = new _accounteffectservice.AccountEffectService(mockPrisma, mockSystemParams);
    });
    describe('applyAccountEffect', ()=>{
        it('should update balance and create movement for SALE APPROVE', async ()=>{
            const mockInvoice = {
                id: 'inv-1',
                tenantId: 'tenant-1',
                accountId: 'acc-1',
                invoiceType: _invoiceenums.InvoiceType.SALE,
                grandTotal: new _library.Decimal(100),
                exchangeRate: new _library.Decimal(1),
                invoiceNo: 'S-001'
            };
            const mockAccount = {
                id: 'acc-1',
                balance: new _library.Decimal(500),
                creditLimit: new _library.Decimal(1000)
            };
            mockPrisma.account.findUnique.mockResolvedValue(mockAccount);
            mockPrisma.account.update.mockResolvedValue({
                ...mockAccount,
                balance: new _library.Decimal(600)
            });
            const tx = mockPrisma; // Simulation as tx
            await service.applyAccountEffect(mockInvoice, tx, 'APPROVE');
            expect(tx.account.update).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    id: 'acc-1'
                },
                data: {
                    balance: {
                        increment: expect.any(_library.Decimal)
                    }
                }
            }));
            expect(tx.accountMovement.create).toHaveBeenCalled();
        });
        it('should throw error if credit limit exceeded', async ()=>{
            const mockInvoice = {
                id: 'inv-1',
                accountId: 'acc-1',
                invoiceType: _invoiceenums.InvoiceType.SALE,
                grandTotal: new _library.Decimal(2000),
                exchangeRate: new _library.Decimal(1)
            };
            const mockAccount = {
                id: 'acc-1',
                balance: new _library.Decimal(0),
                creditLimit: new _library.Decimal(1000)
            };
            mockPrisma.account.findUnique.mockResolvedValue(mockAccount);
            const tx = mockPrisma;
            await expect(service.applyAccountEffect(mockInvoice, tx, 'APPROVE')).rejects.toThrow('Credit limit exceeded');
        });
    });
});

//# sourceMappingURL=account-effect.service.spec.js.map