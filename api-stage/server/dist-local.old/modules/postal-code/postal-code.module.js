"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PostalCodeModule", {
    enumerable: true,
    get: function() {
        return PostalCodeModule;
    }
});
const _common = require("@nestjs/common");
const _postalcodecontroller = require("./postal-code.controller");
const _postalcodeservice = require("./postal-code.service");
const _prismamodule = require("../../common/prisma.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let PostalCodeModule = class PostalCodeModule {
    constructor(){
        console.log('🚀 [PostalCodeModule] initialized');
    }
};
PostalCodeModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _postalcodecontroller.PostalCodeController
        ],
        providers: [
            _postalcodeservice.PostalCodeService
        ],
        imports: [
            _prismamodule.PrismaModule
        ],
        exports: [
            _postalcodeservice.PostalCodeService
        ]
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [])
], PostalCodeModule);

//# sourceMappingURL=postal-code.module.js.map