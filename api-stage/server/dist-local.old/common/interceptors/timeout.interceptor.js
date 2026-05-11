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
    get TIMEOUT_KEY () {
        return TIMEOUT_KEY;
    },
    get Timeout () {
        return Timeout;
    },
    get TimeoutInterceptor () {
        return TimeoutInterceptor;
    }
});
const _common = require("@nestjs/common");
const _rxjs = require("rxjs");
const _operators = require("rxjs/operators");
const _core = require("@nestjs/core");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const TIMEOUT_KEY = 'timeout';
const Timeout = (ms)=>// @ts-ignore - decorator metadata
    (target, propertyKey, descriptor)=>{
        Reflect.defineMetadata(TIMEOUT_KEY, ms, descriptor.value);
        return descriptor;
    };
let TimeoutInterceptor = class TimeoutInterceptor {
    intercept(context, next) {
        // Check for custom timeout from decorator
        const customTimeout = this.reflector.get(TIMEOUT_KEY, context.getHandler());
        // Use custom timeout or default (30 seconds)
        const timeoutMs = customTimeout || 30000;
        return next.handle().pipe((0, _operators.timeout)(timeoutMs), (0, _operators.catchError)((err)=>{
            if (!err) {
                return (0, _rxjs.throwError)(()=>new Error('Unknown timeout error'));
            }
            if (err instanceof _rxjs.TimeoutError) {
                return (0, _rxjs.throwError)(()=>new _common.RequestTimeoutException('İstek zaman aşımına uğradı'));
            }
            // Re-throw other errors
            return (0, _rxjs.throwError)(()=>err);
        }));
    }
    constructor(reflector){
        this.reflector = reflector;
    }
};
TimeoutInterceptor = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _core.Reflector === "undefined" ? Object : _core.Reflector
    ])
], TimeoutInterceptor);

//# sourceMappingURL=timeout.interceptor.js.map