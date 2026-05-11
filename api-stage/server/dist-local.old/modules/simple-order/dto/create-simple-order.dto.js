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
    get CreateSimpleOrderDto () {
        return CreateSimpleOrderDto;
    },
    get SimpleOrderDurum () {
        return SimpleOrderDurum;
    },
    get SimpleOrderStatus () {
        return SimpleOrderStatus;
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
var SimpleOrderStatus = /*#__PURE__*/ function(SimpleOrderStatus) {
    SimpleOrderStatus["AWAITING_APPROVAL"] = "AWAITING_APPROVAL";
    SimpleOrderStatus["APPROVED"] = "APPROVED";
    SimpleOrderStatus["ORDER_PLACED"] = "ORDER_PLACED";
    SimpleOrderStatus["INVOICED"] = "INVOICED";
    SimpleOrderStatus["CANCELLED"] = "CANCELLED";
    return SimpleOrderStatus;
}({});
const SimpleOrderDurum = SimpleOrderStatus;
let CreateSimpleOrderDto = class CreateSimpleOrderDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateSimpleOrderDto.prototype, "companyId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateSimpleOrderDto.prototype, "productId", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(1),
    _ts_metadata("design:type", Number)
], CreateSimpleOrderDto.prototype, "quantity", void 0);

//# sourceMappingURL=create-simple-order.dto.js.map