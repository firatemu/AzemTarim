"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PrismaExceptionFilter", {
    enumerable: true,
    get: function() {
        return PrismaExceptionFilter;
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
let PrismaExceptionFilter = class PrismaExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        // Get or generate request ID
        const requestId = request.headers['x-request-id'] || request.headers['X-Request-ID'] || (0, _uuid.v4)();
        // Extract tenant ID for logging
        const tenantId = request.tenantId || 'unknown';
        const userId = request.userId || 'unknown';
        // Determine error type and map to appropriate HTTP response
        const { status, message, logLevel } = this.handlePrismaError(exception);
        // Log full error internally with tenant context
        const logMessage = `[PRISMA ${exception.code}] ${request.method} ${request.url} | tenant:${tenantId} | user:${userId} | reqId:${requestId} | ${message}`;
        if (logLevel === 'error') {
            this.logger.error(logMessage, exception.stack || 'No stack trace');
        } else if (logLevel === 'warn') {
            this.logger.warn(logMessage);
        }
        // Build error response (NEVER expose Prisma error details)
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
   * Handle Prisma errors and map to HTTP responses
   * @param exception - Prisma exception
   * @returns Status code, message, and log level
   */ handlePrismaError(exception) {
        // Prisma Client Initialization Error (connection failed)
        if (exception instanceof _client.Prisma.PrismaClientInitializationError) {
            return {
                status: _common.HttpStatus.SERVICE_UNAVAILABLE,
                message: 'Veritabanı bağlantısı kurulamadı',
                logLevel: 'error'
            };
        }
        // Invalid query / args (e.g. Invalid Date in where) — log full message for diagnostics
        if (exception instanceof _client.Prisma.PrismaClientValidationError) {
            this.logger.error(`[PrismaClientValidationError] ${exception.message}`);
            return {
                status: _common.HttpStatus.BAD_REQUEST,
                message: 'Geçersiz veritabanı sorgusu',
                logLevel: 'error'
            };
        }
        // Known Prisma request errors
        if (exception instanceof _client.Prisma.PrismaClientKnownRequestError) {
            switch(exception.code){
                case 'P2002':
                    // Unique constraint violation
                    return {
                        status: _common.HttpStatus.CONFLICT,
                        message: 'Bu kayıt zaten mevcut',
                        logLevel: 'warn'
                    };
                case 'P2025':
                    // Record not found
                    return {
                        status: _common.HttpStatus.NOT_FOUND,
                        message: 'Kayıt bulunamadı',
                        logLevel: 'warn'
                    };
                case 'P2003':
                    // Foreign key constraint failed
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'İlişkili kayıt bulunamadı',
                        logLevel: 'warn'
                    };
                case 'P2014':
                    // Relation violation
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Bu kayıt silinemez, ilişkili veriler mevcut',
                        logLevel: 'warn'
                    };
                case 'P2024':
                    // Connection timeout
                    return {
                        status: _common.HttpStatus.SERVICE_UNAVAILABLE,
                        message: 'Veritabanı bağlantısı zaman aşımına uğradı',
                        logLevel: 'error'
                    };
                case 'P2000':
                    // Value too long
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Veri değeri çok uzun',
                        logLevel: 'warn'
                    };
                case 'P2001':
                    // Constraint violation
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Veri doğrulama hatası',
                        logLevel: 'warn'
                    };
                case 'P2006':
                    // Failed validation
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Veri doğrulama hatası',
                        logLevel: 'warn'
                    };
                case 'P2008':
                    // Failed to parse
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Veri formatı hatalı',
                        logLevel: 'warn'
                    };
                case 'P2009':
                    // Failed to validate query
                    return {
                        status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'Veritabanı sorgu hatası',
                        logLevel: 'error'
                    };
                case 'P2010':
                    // Raw query failed
                    return {
                        status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'Veritabanı işlemi başarısız',
                        logLevel: 'error'
                    };
                case 'P2011':
                    // Null constraint violation
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Zorunlu alanlar eksik',
                        logLevel: 'warn'
                    };
                case 'P2012':
                    // Missing value
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Eksik veri',
                        logLevel: 'warn'
                    };
                case 'P2013':
                    // Missing argument
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Eksik parametre',
                        logLevel: 'warn'
                    };
                case 'P2015':
                    // Related records not found
                    return {
                        status: _common.HttpStatus.NOT_FOUND,
                        message: 'İlişkili kayıtlar bulunamadı',
                        logLevel: 'warn'
                    };
                case 'P2016':
                    // Interpretation error
                    return {
                        status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'Veritabanı yorumlama hatası',
                        logLevel: 'error'
                    };
                case 'P2017':
                    // Relation violation
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'İlişkili veriler bulunamadı',
                        logLevel: 'warn'
                    };
                case 'P2018':
                    // Required connected records
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Gerekli ilişkili kayıtlar bulunamadı',
                        logLevel: 'warn'
                    };
                case 'P2019':
                    // Input error
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Veri girişi hatası',
                        logLevel: 'warn'
                    };
                case 'P2020':
                    // Value out of range
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Değer aralık dışında',
                        logLevel: 'warn'
                    };
                case 'P2021':
                    // Table not found
                    return {
                        status: _common.HttpStatus.NOT_FOUND,
                        message: 'Tablo bulunamadı',
                        logLevel: 'error'
                    };
                case 'P2022':
                    // Column not found
                    return {
                        status: _common.HttpStatus.NOT_FOUND,
                        message: 'Sütun bulunamadı',
                        logLevel: 'error'
                    };
                case 'P2023':
                    // Inconsistent column data
                    return {
                        status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'Veritabanı tutarsızlığı',
                        logLevel: 'error'
                    };
                case 'P2026':
                    // Current database doesn't provide support
                    return {
                        status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'Veritabanı desteği mevcut değil',
                        logLevel: 'error'
                    };
                case 'P2027':
                    // Multiple errors occurred
                    return {
                        status: _common.HttpStatus.BAD_REQUEST,
                        message: 'Birden fazla hata oluştu',
                        logLevel: 'warn'
                    };
                case 'P2030':
                    // Full text search failed
                    return {
                        status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'Tam metin araması başarısız',
                        logLevel: 'error'
                    };
                case 'P2031':
                    // Connect error
                    return {
                        status: _common.HttpStatus.SERVICE_UNAVAILABLE,
                        message: 'Veritabanı bağlantı hatası',
                        logLevel: 'error'
                    };
                case 'P2033':
                    // Inconsistent data
                    return {
                        status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'Veritabanı tutarsızlığı',
                        logLevel: 'error'
                    };
                case 'P2034':
                    // Transaction failed
                    return {
                        status: _common.HttpStatus.CONFLICT,
                        message: 'İşlem başarısız',
                        logLevel: 'error'
                    };
                default:
                    // Unknown Prisma error code
                    return {
                        status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'Veritabanı işlemi başarısız',
                        logLevel: 'error'
                    };
            }
        }
        // Unknown Prisma error
        return {
            status: _common.HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Veritabanı işlemi başarısız',
            logLevel: 'error'
        };
    }
    /**
   * Get HTTP status name from status code
   * @param status - HTTP status code
   * @returns Status name (e.g., "NOT_FOUND", "CONFLICT")
   */ getHttpStatusName(status) {
        const statusNames = {
            400: 'BAD_REQUEST',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            500: 'INTERNAL_SERVER_ERROR',
            503: 'SERVICE_UNAVAILABLE'
        };
        return statusNames[status] || 'ERROR';
    }
    constructor(){
        this.logger = new _common.Logger(PrismaExceptionFilter.name);
    }
};
PrismaExceptionFilter = _ts_decorate([
    (0, _common.Catch)(_client.Prisma.PrismaClientKnownRequestError, _client.Prisma.PrismaClientUnknownRequestError, _client.Prisma.PrismaClientRustPanicError, _client.Prisma.PrismaClientInitializationError, _client.Prisma.PrismaClientValidationError)
], PrismaExceptionFilter);

//# sourceMappingURL=prisma-exception.filter.js.map