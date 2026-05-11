"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SseService", {
    enumerable: true,
    get: function() {
        return SseService;
    }
});
const _common = require("@nestjs/common");
const _rxjs = require("rxjs");
const _operators = require("rxjs/operators");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let SseService = class SseService {
    /**
     * Belirli bir tenant için SSE stream döndürür.
     * NestJS @Sse() decorator ile birlikte kullanılır.
     */ getStream(tenantId) {
        return this.subject.asObservable().pipe((0, _operators.filter)((event)=>event.tenantId === tenantId), (0, _operators.map)((event)=>new MessageEvent('message', {
                data: JSON.stringify({
                    type: event.type,
                    ...event.data,
                    timestamp: new Date().toISOString()
                })
            })));
    }
    /**
     * Belirli bir tenant'a event yayınla.
     * Backend worker'larından çağrılır.
     */ emit(tenantId, type, data) {
        this.subject.next({
            tenantId,
            type,
            data
        });
    }
    constructor(){
        this.subject = new _rxjs.Subject();
    }
};
SseService = _ts_decorate([
    (0, _common.Injectable)()
], SseService);

//# sourceMappingURL=sse.service.js.map