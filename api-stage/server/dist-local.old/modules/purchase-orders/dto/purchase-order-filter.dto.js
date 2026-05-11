"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get OrderStatus () {
        return OrderStatus;
    },
    get PurchaseOrderFilterDto () {
        return PurchaseOrderFilterDto;
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
var OrderStatus = /*#__PURE__*/ function(OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["PARTIAL"] = "PARTIAL";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    return OrderStatus;
}({});
let PurchaseOrderFilterDto = class PurchaseOrderFilterDto {
};
_ts_decorate([
    (0, _classvalidator.IsEnum)(OrderStatus),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], PurchaseOrderFilterDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], PurchaseOrderFilterDto.prototype, "supplierId", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], PurchaseOrderFilterDto.prototype, "startDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], PurchaseOrderFilterDto.prototype, "endDate", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], PurchaseOrderFilterDto.prototype, "search", void 0);

//# sourceMappingURL=purchase-order-filter.dto.js.map