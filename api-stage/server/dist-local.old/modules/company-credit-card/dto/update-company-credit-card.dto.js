"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UpdateCompanyCreditCardDto", {
    enumerable: true,
    get: function() {
        return UpdateCompanyCreditCardDto;
    }
});
const _mappedtypes = require("@nestjs/mapped-types");
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
const _createcompanycreditcarddto = require("./create-company-credit-card.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let UpdateCompanyCreditCardDto = class UpdateCompanyCreditCardDto extends (0, _mappedtypes.PartialType)((0, _mappedtypes.OmitType)(_createcompanycreditcarddto.CreateCompanyCreditCardDto, [
    'cashboxId'
])) {
};
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.Min)(0, {
        message: 'Limit 0 veya daha büyük olmalıdır. 0 creditLimitsiz anlamına gelir.'
    }),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classtransformer.Transform)(({ value })=>{
        // String gelirse number'a çevir
        if (typeof value === 'string') {
            const num = parseFloat(value);
            return isNaN(num) ? undefined : num;
        }
        return value;
    }),
    _ts_metadata("design:type", Number)
], UpdateCompanyCreditCardDto.prototype, "creditLimit", void 0);

//# sourceMappingURL=update-company-credit-card.dto.js.map