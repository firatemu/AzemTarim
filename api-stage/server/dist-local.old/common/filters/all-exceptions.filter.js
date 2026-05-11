"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AllExceptionsFilter", {
    enumerable: true,
    get: function() {
        return AllExceptionsFilter;
    }
});
const _common = require("@nestjs/common");
const _client = require("@prisma/client");
const _uuid = require("uuid");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        // Get or generate request ID
        const requestId = request.headers['x-request-id'] || request.headers['X-Request-ID'] || (0, _uuid.v4)();
        // Extract tenant ID for logging
        const tenantId = request.tenantId || 'unknown';
        const userId = request.userId || 'unknown';
        // Handle different error types
        if (this.isPrismaError(exception)) {
            // Prisma errors should be handled by PrismaExceptionFilter
            // But since this is catch-all, we handle it here as fallback
            return this.handlePrismaError(exception, request, response, tenantId, userId, requestId);
        }
        if (this.isHttpException(exception)) {
            // HttpException should be handled by HttpExceptionFilter
            // But we handle it here as fallback
            return this.handleHttpException(exception, request, response, tenantId, userId, requestId);
        }
        if (this.isAxiosError(exception)) {
            // External API failures (Iyzico, GİB, etc.)
            return this.handleAxiosError(exception, request, response, tenantId, userId, requestId);
        }
        // Unknown/Unexpected errors
        return this.handleUnknownError(exception, request, response, tenantId, userId, requestId);
    }
    /**
   * Check if exception is a Prisma error
   */ isPrismaError(exception) {
        return exception instanceof _client.Prisma.PrismaClientKnownRequestError || exception instanceof _client.Prisma.PrismaClientUnknownRequestError || exception instanceof _client.Prisma.PrismaClientRustPanicError || exception instanceof _client.Prisma.PrismaClientInitializationError || exception instanceof _client.Prisma.PrismaClientValidationError;
    }
    /**
   * Check if exception is an HttpException
   */ isHttpException(exception) {
        return typeof exception === 'object' && exception !== null && 'getStatus' in exception && 'getResponse' in exception;
    }
    /**
   * Check if exception is an Axios error
   */ isAxiosError(exception) {
        return typeof exception === 'object' && exception !== null && 'isAxiosError' in exception;
    }
    /**
   * Handle Prisma errors (fallback handler)
   */ handlePrismaError(exception, request, response, tenantId, userId, requestId) {
        const status = _common.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = 'Veritabanı işlemi başarısız';
        this.logger.error(`[PRISMA FALLBACK] ${request.method} ${request.url} | tenant:${tenantId} | user:${userId} | reqId:${requestId} | ${message}`, exception instanceof Error ? exception.stack : String(exception));
        const errorResponse = {
            success: false,
            statusCode: status,
            error: 'INTERNAL_SERVER_ERROR',
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId
        };
        response.status(status).json(errorResponse);
    }
    /**
   * Handle HttpException (fallback handler)
   */ handleHttpException(exception, request, response, tenantId, userId, requestId) {
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        let message = 'An error occurred';
        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        } else if (typeof exceptionResponse === 'object') {
            const responseObj = exceptionResponse;
            message = responseObj.message || responseObj.error || message;
        }
        const logLevel = status >= 500 ? 'error' : 'warn';
        if (logLevel === 'error') {
            this.logger.error(`[HTTP FALLBACK] ${request.method} ${request.url} | tenant:${tenantId} | user:${userId} | reqId:${requestId} | ${message}`);
        } else {
            this.logger.warn(`[HTTP FALLBACK] ${request.method} ${request.url} | tenant:${tenantId} | user:${userId} | reqId:${requestId} | ${message}`);
        }
        const errorResponse = {
            success: false,
            statusCode: status,
            error: this.getHttpStatusName(status),
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId
        };
        response.status(status).json(errorResponse);
    }
    /**
   * Handle Axios errors (external API failures)
   */ handleAxiosError(exception, request, response, tenantId, userId, requestId) {
        const status = _common.HttpStatus.BAD_GATEWAY;
        let message = 'Harici serviste bir hata oluştu';
        // Check if it's a specific external service
        const url = exception.config?.url || '';
        // Iyzico payment errors
        if (url.includes('iyzico') || url.includes('payment')) {
            if (exception.response?.status === 402) {
                return this.handleIyzicoPaymentError(exception, request, response, tenantId, userId, requestId);
            }
            return this.handleIyzicoError(exception, request, response, tenantId, userId, requestId);
        }
        // GİB e-fatura SOAP errors
        if (url.includes('gib') || url.includes('efatura') || url.includes('e-fatura')) {
            return this.handleGibError(exception, request, response, tenantId, userId, requestId);
        }
        // Generic external API error
        this.logger.error(`[EXTERNAL API] ${request.method} ${request.url} | tenant:${tenantId} | user:${userId} | reqId:${requestId} | External API failed: ${url} | ${exception.message}`, exception.stack);
        const errorResponse = {
            success: false,
            statusCode: status,
            error: 'BAD_GATEWAY',
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId
        };
        response.status(status).json(errorResponse);
    }
    /**
   * Handle Iyzico payment errors
   */ handleIyzicoPaymentError(exception, request, response, tenantId, userId, requestId) {
        const status = _common.HttpStatus.PAYMENT_REQUIRED;
        const data = exception.response?.data;
        const msgFromData = data && typeof data === 'object' && 'message' in data && typeof data.message === 'string' ? data.message : undefined;
        const message = msgFromData || 'Ödeme işlemi başarısız';
        this.logger.error(`[IYZICO] ${request.method} ${request.url} | tenant:${tenantId} | user:${userId} | reqId:${requestId} | Payment failed: ${message}`, exception.stack);
        const errorResponse = {
            success: false,
            statusCode: status,
            error: 'PAYMENT_REQUIRED',
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId
        };
        response.status(status).json(errorResponse);
    }
    /**
   * Handle other Iyzico errors
   */ handleIyzicoError(exception, request, response, tenantId, userId, requestId) {
        const status = _common.HttpStatus.BAD_GATEWAY;
        const message = 'Ödeme servisi şu an kullanılamıyor';
        this.logger.error(`[IYZICO] ${request.method} ${request.url} | tenant:${tenantId} | user:${userId} | reqId:${requestId} | Iyzico service unavailable`, exception.stack);
        const errorResponse = {
            success: false,
            statusCode: status,
            error: 'BAD_GATEWAY',
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId
        };
        response.status(status).json(errorResponse);
    }
    /**
   * Handle GİB e-fatura SOAP errors
   */ handleGibError(exception, request, response, tenantId, userId, requestId) {
        const status = _common.HttpStatus.BAD_GATEWAY;
        const message = 'E-fatura servisi şu an kullanılamıyor';
        this.logger.error(`[GİB EFATURA] ${request.method} ${request.url} | tenant:${tenantId} | user:${userId} | reqId:${requestId} | E-fatura service unavailable`, exception.stack);
        const errorResponse = {
            success: false,
            statusCode: status,
            error: 'BAD_GATEWAY',
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId
        };
        response.status(status).json(errorResponse);
    }
    /**
   * Handle unknown/unexpected errors
   */ handleUnknownError(exception, request, response, tenantId, userId, requestId) {
        const status = _common.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = 'Beklenmeyen bir hata oluştu';
        const errorMessage = exception instanceof Error ? exception.message : String(exception);
        const stackTrace = exception instanceof Error ? exception.stack : undefined;
        this.logger.error(`[UNEXPECTED ERROR] ${request.method} ${request.url} | tenant:${tenantId} | user:${userId} | reqId:${requestId} | ${errorMessage}`, stackTrace || 'No stack trace available');
        const errorResponse = {
            success: false,
            statusCode: status,
            error: 'INTERNAL_SERVER_ERROR',
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId
        };
        response.status(status).json(errorResponse);
    }
    /**
   * Get HTTP status name from status code
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
        this.logger = new _common.Logger(AllExceptionsFilter.name);
    }
};
AllExceptionsFilter = _ts_decorate([
    (0, _common.Catch)()
], AllExceptionsFilter);

//# sourceMappingURL=all-exceptions.filter.js.map