"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LoggingInterceptor", {
    enumerable: true,
    get: function() {
        return LoggingInterceptor;
    }
});
const _common = require("@nestjs/common");
const _operators = require("rxjs/operators");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let LoggingInterceptor = class LoggingInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        // Skip logging for health check endpoints
        if (this.shouldSkipLogging(request.path)) {
            return next.handle();
        }
        const startTime = Date.now();
        // Extract request metadata
        const method = request.method;
        const path = request.path;
        const tenantId = request.tenantId || 'unknown';
        const userId = request.userId || 'unknown';
        const requestId = request.headers['x-request-id'] || request.headers['X-Request-ID'] || 'no-req-id';
        // Log incoming request
        this.logger.log(`[REQUEST] ${method} ${path} | tenant:${tenantId} | user:${userId} | reqId:${requestId}`);
        // Log outgoing response
        return next.handle().pipe((0, _operators.tap)({
            next: ()=>{
                const duration = Date.now() - startTime;
                const statusCode = response.statusCode;
                const logLevel = this.getLogLevel(duration);
                const logMethod = logLevel === 'error' ? this.logger.error.bind(this.logger) : logLevel === 'warn' ? this.logger.warn.bind(this.logger) : this.logger.log.bind(this.logger);
                logMethod(`[RESPONSE] ${method} ${path} | ${statusCode} | ${duration}ms | tenant:${tenantId} | user:${userId} | reqId:${requestId}`);
            },
            error: (error)=>{
                const duration = Date.now() - startTime;
                this.logger.error(`[RESPONSE ERROR] ${method} ${path} | ${duration}ms | tenant:${tenantId} | user:${userId} | reqId:${requestId} | ${error.message}`);
            }
        }));
    }
    /**
   * Determine if logging should be skipped for this path
   * @param path - Request path
   * @returns true if logging should be skipped
   */ shouldSkipLogging(path) {
        const skipPaths = [
            '/health',
            '/metrics',
            '/favicon.ico'
        ];
        return skipPaths.some((skipPath)=>path.startsWith(skipPath));
    }
    /**
   * Determine log level based on response time
   * @param duration - Response time in milliseconds
   * @returns Log level ('log', 'warn', or 'error')
   */ getLogLevel(duration) {
        if (duration > 3000) {
            return 'error';
        } else if (duration > 1000) {
            return 'warn';
        }
        return 'log';
    }
    constructor(){
        this.logger = new _common.Logger(LoggingInterceptor.name);
    }
};
LoggingInterceptor = _ts_decorate([
    (0, _common.Injectable)()
], LoggingInterceptor);

//# sourceMappingURL=logging.interceptor.js.map