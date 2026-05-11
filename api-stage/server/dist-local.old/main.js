"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _common = require("@nestjs/common");
const _appmodule = require("./app.module");
const _swagger = require("@nestjs/swagger");
const _filters = require("./common/filters");
const _interceptors = require("./common/interceptors");
const _helmet = /*#__PURE__*/ _interop_require_default(require("helmet"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const compression = require("compression");
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule, {
        logger: [
            'log',
            'error',
            'warn'
        ]
    });
    // Proxy arkasında gerçek IP'yi almak için (Rate limit için kritik)
    app.set('trust proxy', 1);
    // Security Headers - Helmet
    app.use((0, _helmet.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: [
                    "'self'"
                ],
                scriptSrc: [
                    "'self'"
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'"
                ],
                imgSrc: [
                    "'self'",
                    'data:',
                    'https:'
                ]
            }
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        frameguard: {
            action: 'deny'
        },
        noSniff: true,
        referrerPolicy: {
            policy: 'strict-origin-when-cross-origin'
        }
    }));
    // Response compression - Performans için
    app.use(compression());
    // CORS ayarları
    const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((origin)=>origin.trim()) : [
        // Staging origins
        'https://staging.otomuhasebe.com',
        'https://staging-api.otomuhasebe.com',
        // Local development origins (all common ports)
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3010',
        'http://localhost:3011',
        'http://localhost:3020',
        'http://localhost:3021',
        'http://localhost:3022',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3010',
        'http://127.0.0.1:3011',
        'http://127.0.0.1:3020',
        'http://127.0.0.1:3021',
        'http://127.0.0.1:3022'
    ];
    app.enableCors({
        origin: (origin, callback)=>{
            // Allow requests with no origin (same-origin, mobile apps, server-to-server)
            if (!origin) {
                callback(null, true);
                return;
            }
            // Check if origin is in allowlist
            if (corsOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn('🚫 CORS blocked origin:', origin);
                // ✅ FIX: Return false, not Error object
                callback(null, false);
            }
        },
        credentials: true,
        methods: [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'PATCH',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'Origin',
            'x-tenant-id',
            'X-Request-ID'
        ],
        exposedHeaders: [
            'Authorization'
        ],
        preflightContinue: false,
        optionsSuccessStatus: 204,
        maxAge: 86400
    });
    // ═══════════════════════════════════════════════════════════════
    // GLOBAL INTERCEPTORS
    // ═══════════════════════════════════════════════════════════════
    // Order matters: Interceptors are executed in LIFO order (Last In First Out)
    // So first registered interceptor runs first
    app.useGlobalInterceptors(new _interceptors.LoggingInterceptor());
    // ═══════════════════════════════════════════════════════════════
    // GLOBAL EXCEPTION FILTERS
    // ═══════════════════════════════════════════════════════════════
    // IMPORTANT: Filter registration order is OPPOSITE of interceptor order
    // Last registered filter = Outermost = First to catch exceptions
    // 
    // Execution flow:
    // 1. LoggingInterceptor (request)
    // 2. TimeoutInterceptor (request)
    // 3. Controller → Service → Database
    // 4. Exception thrown
    // 5. HttpExceptionFilter (most specific - catches 4xx/5xx)
    // 6. PrismaExceptionFilter (catches Prisma errors)
    // 7. AllExceptionsFilter (catch-all - last line of defense)
    // 8. TimeoutInterceptor (response)
    // 9. LoggingInterceptor (response)
    app.useGlobalFilters(new _filters.AllExceptionsFilter(), new _filters.PrismaExceptionFilter(), new _filters.HttpExceptionFilter());
    // ═══════════════════════════════════════════════════════════════
    // GLOBAL VALIDATION PIPE
    // ═══════════════════════════════════════════════════════════════
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
            exposeDefaultValues: true,
            // Enable enum transformation
            enableCircularCheck: true,
            excludeExtraneousValues: false
        },
        // Don't stop at first error - show all validation errors
        exceptionFactory: (errors)=>{
            const formattedErrors = errors.map((err)=>{
                return {
                    field: err.property,
                    constraints: err.constraints,
                    value: err.value
                };
            });
            console.error('[ValidationPipe] Validation error:', formattedErrors);
            const { BadRequestException } = require('@nestjs/common');
            return new BadRequestException({
                message: 'Validation failed',
                errors: formattedErrors
            });
        }
    }));
    // Global prefix
    app.setGlobalPrefix('api');
    // Swagger/OpenAPI Yapılandırması
    const config = new _swagger.DocumentBuilder().setTitle('Oto Muhasebe API').setDescription('Oto Muhasebe ERP/SaaS API Dokümantasyonu').setVersion('1.0').addTag('auth').addTag('tenants').addBearerAuth().build();
    try {
        const document = _swagger.SwaggerModule.createDocument(app, config);
        _swagger.SwaggerModule.setup('api-docs', app, document, {
            jsonDocumentUrl: 'api-json'
        });
    } catch (err) {
        console.warn('⚠️ Swagger document creation skipped (e.g. circular enum):', err?.message || err);
    }
    // Static files serving - uploads klasörü için (Docker volume ile kalıcı)
    const express = require('express');
    const path = require('path');
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    try {
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, {
                recursive: true
            });
            console.log('📁 Created uploads directory:', uploadsDir);
        }
    } catch (err) {
        console.warn('⚠️ Could not ensure uploads directory:', err.message);
    }
    app.use('/api/uploads', express.static(uploadsDir));
    // Sabit port: 3020 (staging API portu)
    const port = process.env.PORT || 3020;
    await app.listen(port, '0.0.0.0'); // Tüm interface'lerde dinle
    console.log(`🚀 Yedek Parça Otomasyonu Backend çalışıyor: http://localhost:${port}`);
    console.log(`📚 API Endpoint: http://localhost:${port}/api`);
}
bootstrap();

//# sourceMappingURL=main.js.map