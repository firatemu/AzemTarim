"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _b2briskcheckservice = require("../b2b-risk-check.service");
describe('B2bRiskCheckService', ()=>{
    let service;
    let mockPrisma;
    beforeEach(()=>{
        mockPrisma = {
            b2BCustomer: {
                findFirst: jest.fn()
            },
            account: {
                findFirst: jest.fn()
            }
        };
        service = new _b2briskcheckservice.B2bRiskCheckService(mockPrisma);
    });
    describe('assertOrderAllowed', ()=>{
        const defaultCustomer = {
            erpAccountId: 'acc1'
        };
        const defaultAccount = {
            balance: '1000',
            creditLimit: '5000',
            creditStatus: _client.RiskStatus.OK
        };
        it('allows order when no risk issues and within credit limit', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
            mockPrisma.account.findFirst.mockResolvedValue(defaultAccount);
            await expect(service.assertOrderAllowed('t1', 'c1', new _client.Prisma.Decimal('500'))).resolves.not.toThrow();
        });
        it('throws when customer not found', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue(null);
            await expect(service.assertOrderAllowed('t1', 'c1', new _client.Prisma.Decimal('100'))).rejects.toThrow(_common.BadRequestException);
        });
        it('throws when ERP account not found', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
            mockPrisma.account.findFirst.mockResolvedValue(null);
            await expect(service.assertOrderAllowed('t1', 'c1', new _client.Prisma.Decimal('100'))).rejects.toThrow(_common.BadRequestException);
        });
        it('throws when account is BLACK_LISTED', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
            mockPrisma.account.findFirst.mockResolvedValue({
                ...defaultAccount,
                creditStatus: _client.RiskStatus.BLACK_LIST
            });
            const error = await service.assertOrderAllowed('t1', 'c1', new _client.Prisma.Decimal('100')).catch((e)=>e);
            expect(error).toBeInstanceOf(_common.BadRequestException);
            expect(error.response).toEqual({
                message: 'Cari risk durumu nedeniyle sipariş verilemez',
                code: 'B2B_RISK_BLOCKED'
            });
        });
        it('throws when account is IN_COLLECTION', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
            mockPrisma.account.findFirst.mockResolvedValue({
                ...defaultAccount,
                creditStatus: _client.RiskStatus.IN_COLLECTION
            });
            const error = await service.assertOrderAllowed('t1', 'c1', new _client.Prisma.Decimal('100')).catch((e)=>e);
            expect(error).toBeInstanceOf(_common.BadRequestException);
            expect(error.response).toEqual({
                message: 'Cari risk durumu nedeniyle sipariş verilemez',
                code: 'B2B_RISK_BLOCKED'
            });
        });
        it('allows order when creditStatus is RISKY but within limit', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
            mockPrisma.account.findFirst.mockResolvedValue({
                ...defaultAccount,
                creditStatus: _client.RiskStatus.RISKY
            });
            await expect(service.assertOrderAllowed('t1', 'c1', new _client.Prisma.Decimal('500'))).resolves.not.toThrow();
        });
        it('throws when order would exceed credit limit', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
            mockPrisma.account.findFirst.mockResolvedValue({
                balance: '4500',
                creditLimit: '5000',
                creditStatus: _client.RiskStatus.OK
            });
            const error = await service.assertOrderAllowed('t1', 'c1', new _client.Prisma.Decimal('600')).catch((e)=>e);
            expect(error).toBeInstanceOf(_common.BadRequestException);
            expect(error.response).toEqual({
                message: 'Kredi limiti aşılıyor',
                code: 'B2B_CREDIT_LIMIT'
            });
        });
        it('allows order when at exactly credit limit', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
            mockPrisma.account.findFirst.mockResolvedValue({
                balance: '4500',
                creditLimit: '5000',
                creditStatus: _client.RiskStatus.OK
            });
            await expect(service.assertOrderAllowed('t1', 'c1', new _client.Prisma.Decimal('500'))).resolves.not.toThrow();
        });
        it('allows any order when creditLimit is null (no limit)', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
            mockPrisma.account.findFirst.mockResolvedValue({
                balance: '999999',
                creditLimit: null,
                creditStatus: _client.RiskStatus.OK
            });
            await expect(service.assertOrderAllowed('t1', 'c1', new _client.Prisma.Decimal('100000'))).resolves.not.toThrow();
        });
        it('handles negative balance (credit) correctly', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
            mockPrisma.account.findFirst.mockResolvedValue({
                balance: '-500',
                creditLimit: '2000',
                creditStatus: _client.RiskStatus.OK
            });
            // Should allow: -500 + 1000 = 500, which is less than 2000 limit
            await expect(service.assertOrderAllowed('t1', 'c1', new _client.Prisma.Decimal('1000'))).resolves.not.toThrow();
        });
        it('uses Prisma.Decimal for precise calculations', async ()=>{
            mockPrisma.b2BCustomer.findFirst.mockResolvedValue(defaultCustomer);
            mockPrisma.account.findFirst.mockResolvedValue({
                balance: '1000.55',
                creditLimit: '2000.99',
                creditStatus: _client.RiskStatus.OK
            });
            // Should allow: 1000.55 + 999.99 = 2000.54, which is less than 2000.99
            await expect(service.assertOrderAllowed('t1', 'c1', new _client.Prisma.Decimal('999.99'))).resolves.not.toThrow();
        });
    });
});

//# sourceMappingURL=b2b-risk-check.service.spec.js.map