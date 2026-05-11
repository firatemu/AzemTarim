"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClosePosSessionDto", {
    enumerable: true,
    get: function() {
        return ClosePosSessionDto;
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
let ClosePosSessionDto = class ClosePosSessionDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Kapanış amountı'
    }),
    _ts_metadata("design:type", Number)
], ClosePosSessionDto.prototype, "closingAmount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Kapanış notesı'
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], ClosePosSessionDto.prototype, "closingNotes", void 0);

//# sourceMappingURL=close-pos-session.dto.js.map