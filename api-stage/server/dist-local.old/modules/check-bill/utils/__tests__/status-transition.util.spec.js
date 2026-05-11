"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _statustransitionutil = require("../status-transition.util");
describe('assertLegalTransition (çek/senet v2)', ()=>{
    it('allows IN_PORTFOLIO -> SENT_TO_BANK', ()=>{
        expect(()=>(0, _statustransitionutil.assertLegalTransition)(_client.CheckBillStatus.IN_PORTFOLIO, _client.CheckBillStatus.SENT_TO_BANK)).not.toThrow();
    });
    it('allows SENT_TO_BANK -> DISCOUNTED', ()=>{
        expect(()=>(0, _statustransitionutil.assertLegalTransition)(_client.CheckBillStatus.SENT_TO_BANK, _client.CheckBillStatus.DISCOUNTED)).not.toThrow();
    });
    it('rejects COLLECTED -> RETURNED (terminal)', ()=>{
        expect(()=>(0, _statustransitionutil.assertLegalTransition)(_client.CheckBillStatus.COLLECTED, _client.CheckBillStatus.RETURNED)).toThrow(_common.BadRequestException);
    });
    it('no-op when from is null', ()=>{
        expect(()=>(0, _statustransitionutil.assertLegalTransition)(null, _client.CheckBillStatus.IN_PORTFOLIO)).not.toThrow();
    });
});

//# sourceMappingURL=status-transition.util.spec.js.map