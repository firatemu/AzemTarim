"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantSecurityExceptionFilter", {
    enumerable: true,
    get: function() {
        return TenantSecurityExceptionFilter;
    }
});
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let TenantSecurityExceptionFilter = class TenantSecurityExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        const message = typeof exceptionResponse === 'object' ? exceptionResponse.message : exceptionResponse;
        // Check if it is a Tenant Security Error
        if (message && (message.includes('Tenant context missing') || message.includes('Security Alert'))) {
            // 1. Log Critically
            this.logger.error(`🚨 [SECURITY BREACH ATTEMPT] ${message}`);
            // 2. Mask the error to the client
            response.status(_common.HttpStatus.INTERNAL_SERVER_ERROR).json({
                statusCode: _common.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal Server Error',
                timestamp: new Date().toISOString()
            });
        } else {
            // Pass through other BadRequestExceptions (validation errors, etc.)
            response.status(status).json(exceptionResponse);
        }
    }
    constructor(){
        this.logger = new _common.Logger(TenantSecurityExceptionFilter.name);
    }
};
TenantSecurityExceptionFilter = _ts_decorate([
    (0, _common.Catch)(_common.BadRequestException)
], TenantSecurityExceptionFilter);

//# sourceMappingURL=tenant-security-exception.filter.js.map