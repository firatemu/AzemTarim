"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SseModule", {
    enumerable: true,
    get: function() {
        return SseModule;
    }
});
const _common = require("@nestjs/common");
const _sseservice = require("./sse.service");
const _ssecontroller = require("./sse.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let SseModule = class SseModule {
};
SseModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _ssecontroller.SseController
        ],
        providers: [
            _sseservice.SseService
        ],
        exports: [
            _sseservice.SseService
        ]
    })
], SseModule);

//# sourceMappingURL=sse.module.js.map