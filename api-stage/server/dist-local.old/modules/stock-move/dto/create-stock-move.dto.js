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
    get CreateStockMoveDto () {
        return CreateStockMoveDto;
    },
    get StockMoveType () {
        return StockMoveType;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
var StockMoveType = /*#__PURE__*/ function(StockMoveType) {
    StockMoveType["PUT_AWAY"] = "PUT_AWAY";
    StockMoveType["TRANSFER"] = "TRANSFER";
    StockMoveType["PICKING"] = "PICKING";
    StockMoveType["ADJUSTMENT"] = "ADJUSTMENT";
    StockMoveType["SALE"] = "SALE";
    StockMoveType["RETURN"] = "RETURN";
    StockMoveType["DAMAGE"] = "DAMAGE";
    return StockMoveType;
}({});
let CreateStockMoveDto = class CreateStockMoveDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateStockMoveDto.prototype, "productId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateStockMoveDto.prototype, "fromWarehouseId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateStockMoveDto.prototype, "fromLocationId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateStockMoveDto.prototype, "toWarehouseId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateStockMoveDto.prototype, "toLocationId", void 0);
_ts_decorate([
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    _ts_metadata("design:type", Number)
], CreateStockMoveDto.prototype, "qty", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: StockMoveType
    }),
    (0, _classvalidator.IsEnum)(StockMoveType),
    _ts_metadata("design:type", String)
], CreateStockMoveDto.prototype, "moveType", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateStockMoveDto.prototype, "refType", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateStockMoveDto.prototype, "refId", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateStockMoveDto.prototype, "note", void 0);

//# sourceMappingURL=create-stock-move.dto.js.map