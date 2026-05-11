"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2BPrismaModule", {
    enumerable: true,
    get: function() {
        return B2BPrismaModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _b2bprismaservice = require("./b2b-prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let B2BPrismaModule = class B2BPrismaModule {
};
B2BPrismaModule = _ts_decorate([
    (0, _common.Global)(),
    (0, _common.Module)({
        imports: [
            _config.ConfigModule
        ],
        providers: [
            _b2bprismaservice.B2BPrismaService
        ],
        exports: [
            _b2bprismaservice.B2BPrismaService
        ]
    })
], B2BPrismaModule);

//# sourceMappingURL=b2b-prisma.module.js.map