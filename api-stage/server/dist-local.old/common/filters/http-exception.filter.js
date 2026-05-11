"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HttpExceptionFilter", {
    enumerable: true,
    get: function() {
        return HttpExceptionFilter;
    }
});
const _common = require("@nestjs/common");
const _uuid = require("uuid");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        // Get or generate request ID
        const requestId = request.headers['x-request-id'] || request.headers['X-Request-ID'] || (0, _uuid.v4)();
        // Extract status code
        const status = exception.getStatus();
        // Extract message from exception
        const exceptionResponse = exception.getResponse();
        let message = 'An error occurred';
        let details = undefined;
        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        } else if (typeof exceptionResponse === 'object') {
            const responseObj = exceptionResponse;
            message = responseObj.message || responseObj.error || message;
            // If it's a validation error with multiple messages
            if (responseObj.errors && Array.isArray(responseObj.errors)) {
                message = responseObj.message || 'Validation failed';
            }
            // Preserve additional details (e.g., risk limit excess amount)
            if (responseObj.details) {
                details = responseObj.details;
            }
            // Preserve error code for frontend handling
            if (responseObj.error && typeof responseObj.error === 'string' && responseObj.error !== 'BAD_REQUEST') {
                details = details || {};
                details.errorCode = responseObj.error;
            }
        }
        // Extract tenant ID from request for logging
        const tenantId = request.tenantId || 'unknown';
        const userId = request.userId || 'unknown';
        // Build error response
        const errorResponse = {
            success: false,
            statusCode: status,
            error: this.getHttpStatusName(status),
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId
        };
        // Include details if available (e.g., risk limit excess amount)
        if (details) {
            errorResponse.details = details;
        }
        // Log based on status code
        if (status >= 500) {
            // Server errors - log with error level
            this.logger.error(`[HTTP ${status}] ${request.method} ${request.url} | tenant:${tenantId} | user:${userId} | reqId:${requestId} | ${message}`);
        } else if (status >= 400) {
            // Client errors - log with warn level
            this.logger.warn(`[HTTP ${status}] ${request.method} ${request.url} | tenant:${tenantId} | user:${userId} | reqId:${requestId} | ${message}`);
        }
        // Never expose stack traces
        response.status(status).json(errorResponse);
    }
    /**
   * Get HTTP status name from status code
   * @param status - HTTP status code
   * @returns Status name (e.g., "NOT_FOUND", "CONFLICT")
   */ getHttpStatusName(status) {
        const statusNames = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            402: 'PAYMENT_REQUIRED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            408: 'REQUEST_TIMEOUT',
            409: 'CONFLICT',
            422: 'UNPROCESSABLE_ENTITY',
            429: 'TOO_MANY_REQUESTS',
            500: 'INTERNAL_SERVER_ERROR',
            502: 'BAD_GATEWAY',
            503: 'SERVICE_UNAVAILABLE',
            504: 'GATEWAY_TIMEOUT'
        };
        return statusNames[status] || 'ERROR';
    }
    constructor(){
        this.logger = new _common.Logger(HttpExceptionFilter.name);
    }
};
HttpExceptionFilter = _ts_decorate([
    (0, _common.Catch)(_common.HttpException)
], HttpExceptionFilter);

//# sourceMappingURL=http-exception.filter.js.map