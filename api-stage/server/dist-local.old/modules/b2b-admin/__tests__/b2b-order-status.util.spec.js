"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _b2badminconstants = require("../b2b-admin.constants");
const _b2borderstatusutil = require("../b2b-order-status.util");
describe('assertB2bOrderStatusTransition', ()=>{
    it('every transition listed in B2B_ORDER_STATUS_TRANSITIONS succeeds', ()=>{
        for (const [from, targets] of Object.entries(_b2badminconstants.B2B_ORDER_STATUS_TRANSITIONS)){
            for (const to of targets){
                expect(()=>(0, _b2borderstatusutil.assertB2bOrderStatusTransition)(from, to)).not.toThrow();
            }
        }
    });
    it('rejects EXPORTED_TO_ERP -> APPROVED', ()=>{
        expect(()=>(0, _b2borderstatusutil.assertB2bOrderStatusTransition)(_client.B2BOrderStatus.EXPORTED_TO_ERP, _client.B2BOrderStatus.APPROVED)).toThrow(_common.BadRequestException);
    });
    it('rejects CANCELLED -> EXPORTED_TO_ERP', ()=>{
        expect(()=>(0, _b2borderstatusutil.assertB2bOrderStatusTransition)(_client.B2BOrderStatus.CANCELLED, _client.B2BOrderStatus.EXPORTED_TO_ERP)).toThrow(_common.BadRequestException);
    });
    it('allows PENDING -> APPROVED', ()=>{
        expect(()=>(0, _b2borderstatusutil.assertB2bOrderStatusTransition)(_client.B2BOrderStatus.PENDING, _client.B2BOrderStatus.APPROVED)).not.toThrow();
    });
    it('allows APPROVED -> EXPORTED_TO_ERP', ()=>{
        expect(()=>(0, _b2borderstatusutil.assertB2bOrderStatusTransition)(_client.B2BOrderStatus.APPROVED, _client.B2BOrderStatus.EXPORTED_TO_ERP)).not.toThrow();
    });
    it('allows EXPORTED_TO_ERP -> CANCELLED (per B2B_ORDER_STATUS_TRANSITIONS)', ()=>{
        expect(()=>(0, _b2borderstatusutil.assertB2bOrderStatusTransition)(_client.B2BOrderStatus.EXPORTED_TO_ERP, _client.B2BOrderStatus.CANCELLED)).not.toThrow();
    });
    it('rejects REJECTED -> APPROVED', ()=>{
        expect(()=>(0, _b2borderstatusutil.assertB2bOrderStatusTransition)(_client.B2BOrderStatus.REJECTED, _client.B2BOrderStatus.APPROVED)).toThrow(_common.BadRequestException);
    });
    it('rejects CANCELLED -> PENDING', ()=>{
        expect(()=>(0, _b2borderstatusutil.assertB2bOrderStatusTransition)(_client.B2BOrderStatus.CANCELLED, _client.B2BOrderStatus.PENDING)).toThrow(_common.BadRequestException);
    });
});

//# sourceMappingURL=b2b-order-status.util.spec.js.map