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
    get LoggingInterceptor () {
        return _logginginterceptor.LoggingInterceptor;
    },
    get TIMEOUT_KEY () {
        return _timeoutinterceptor.TIMEOUT_KEY;
    },
    get Timeout () {
        return _timeoutinterceptor.Timeout;
    },
    get TimeoutInterceptor () {
        return _timeoutinterceptor.TimeoutInterceptor;
    }
});
const _logginginterceptor = require("./logging.interceptor");
const _timeoutinterceptor = require("./timeout.interceptor");

//# sourceMappingURL=index.js.map