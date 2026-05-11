"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _appmodule = require("../../app.module");
const _prismaservice = require("../../common/prisma.service");
const _common = require("@nestjs/common");
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
async function bootstrap() {
    const logger = new _common.Logger('SeedSuperAdmin');
    const app = await _core.NestFactory.createApplicationContext(_appmodule.AppModule);
    const prisma = app.get(_prismaservice.PrismaService); // RAW client (no extension applied yet)
    try {
        const args = process.argv.slice(2);
        const reset = args.includes('--reset');
        // 1. SAFETY CHECK
        if (process.env.NODE_ENV === 'production' && process.env.APP_ENV !== 'staging') {
            if (reset) {
                logger.error('🚨 CRITICAL SAFETY LOCK: Cannot reset database in PRODUCTION!');
                process.exit(1);
            }
        }
        // 2. Database Wipe (Optional)
        if (reset) {
            logger.warn('⚠️  RESETTING DATABASE (NUCLEAR WIPE)...');
            const tablenames = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
            const tables = tablenames.map(({ tablename })=>tablename).filter((name)=>name !== '_prisma_migrations').map((name)=>`"public"."${name}"`).join(', ');
            if (tables.length > 0) {
                try {
                    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
                    logger.log('✅ Database wiped successfully (TRUNCATE CASCADE).');
                } catch (error) {
                    logger.error(`Failed to truncate: ${error.message}`);
                    process.exit(1);
                }
            }
        }
        // 3. Create Default Tenant (Staging Host)
        logger.log('... Creating Default Tenant (Staging)');
        const defaultTenant = await prisma.tenant.upsert({
            where: {
                subdomain: 'staging'
            },
            update: {},
            create: {
                name: 'Azem Yazılım Staging',
                subdomain: 'staging',
                status: 'ACTIVE'
            }
        });
        logger.log(`✓ Default Tenant Created: ${defaultTenant.id}`);
        // 4. Create/Update SuperAdmin
        const email = 'info@azemyazilim.com';
        const password = '1212';
        const hashedPassword = await _bcrypt.hash(password, 10);
        const existingSuperAdmin = await prisma.user.findFirst({
            where: {
                email
            }
        });
        if (existingSuperAdmin) {
            logger.log('⚠️  SuperAdmin already exists. Updating password and linking to tenant...');
            await prisma.user.update({
                where: {
                    id: existingSuperAdmin.id
                },
                data: {
                    password: hashedPassword,
                    role: 'SUPER_ADMIN',
                    isActive: true,
                    tenantId: defaultTenant.id,
                    fullName: 'Azem Super Admin'
                }
            });
            logger.log(`✅ SuperAdmin Updated: ${existingSuperAdmin.id} (Linked to Tenant: ${defaultTenant.id})`);
        } else {
            const user = await prisma.user.create({
                data: {
                    email,
                    username: 'info',
                    fullName: 'Azem Super Admin',
                    password: hashedPassword,
                    role: 'SUPER_ADMIN',
                    isActive: true,
                    firstName: 'Azem',
                    lastName: 'Super Admin',
                    tenantId: defaultTenant.id
                }
            });
            logger.log(`✅ SuperAdmin Created: ${user.id} (Email: ${email}, Tenant: ${defaultTenant.id})`);
        }
    } catch (error) {
        logger.error(`❌ Seeding failed: ${error.message}`, error.stack);
        process.exit(1);
    } finally{
        await app.close();
    }
}
bootstrap();

//# sourceMappingURL=seed-superadmin.command.js.map