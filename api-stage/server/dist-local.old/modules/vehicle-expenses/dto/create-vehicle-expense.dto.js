"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateVehicleExpenseDto", {
    enumerable: true,
    get: function() {
        return CreateVehicleExpenseDto;
    }
});
const _classvalidator = require("class-validator");
const _client = require("@prisma/client");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateVehicleExpenseDto = class CreateVehicleExpenseDto {
};
_ts_decorate([
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateVehicleExpenseDto.prototype, "vehicleId", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(_client.VehicleExpenseType),
    _ts_metadata("design:type", typeof _client.VehicleExpenseType === "undefined" ? Object : _client.VehicleExpenseType)
], CreateVehicleExpenseDto.prototype, "expenseType", void 0);
_ts_decorate([
    (0, _classvalidator.IsDateString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateVehicleExpenseDto.prototype, "date", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateVehicleExpenseDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateVehicleExpenseDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], CreateVehicleExpenseDto.prototype, "documentNo", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateVehicleExpenseDto.prototype, "mileage", void 0);

//# sourceMappingURL=create-vehicle-expense.dto.js.map