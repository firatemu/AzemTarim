"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BulkPutAwayDto", {
    enumerable: true,
    get: function() {
        return BulkPutAwayDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
const _putawaydto = require("./put-away.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let BulkPutAwayDto = class BulkPutAwayDto {
};
_ts_decorate([
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ArrayMinSize)(1, {
        message: 'En az 1 adet işlem gerekli'
    }),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>_putawaydto.PutAwayDto),
    _ts_metadata("design:type", Array)
], BulkPutAwayDto.prototype, "operations", void 0);

//# sourceMappingURL=bulk-put-away.dto.js.map