"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CheckBillBulkActionDto", {
    enumerable: true,
    get: function() {
        return CheckBillBulkActionDto;
    }
});
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CheckBillBulkActionDto = class CheckBillBulkActionDto {
};
_ts_decorate([
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ArrayMinSize)(1),
    (0, _classvalidator.IsUUID)('4', {
        each: true
    }),
    _ts_metadata("design:type", Array)
], CheckBillBulkActionDto.prototype, "checkBillIds", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)([
        'soft_delete'
    ]),
    _ts_metadata("design:type", String)
], CheckBillBulkActionDto.prototype, "action", void 0);

//# sourceMappingURL=check-bill-bulk.dto.js.map