"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _appmodule = require("../../app.module");
const _prismaservice = require("../../common/prisma.service");
const _tenantcontextservice = require("../../common/services/tenant-context.service");
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
    const logger = new _common.Logger('Seeder');
    const app = await _core.NestFactory.createApplicationContext(_appmodule.AppModule);
    const prisma = app.get(_prismaservice.PrismaService);
    const tenantContext = app.get(_tenantcontextservice.TenantContextService);
    // Parse args
    const args = process.argv.slice(2);
    const nameArg = args.find((a)=>a.startsWith('--name='));
    const emailArg = args.find((a)=>a.startsWith('--email='));
    if (!nameArg || !emailArg) {
        logger.error('Usage: npm run seed:tenant -- --name="Company Name" --email="admin@company.com"');
        await app.close();
        process.exit(1);
    }
    const name = nameArg.split('=')[1];
    const email = emailArg.split('=')[1];
    logger.log(`🌱 Seeding Tenant: ${name} (${email})`);
    try {
        // Run as System to bypass tenant guards during creation
        await tenantContext.runAsSystem(async ()=>{
            // 1. Create Tenant
            const tenant = await prisma.tenant.create({
                data: {
                    name,
                    subdomain: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    status: 'ACTIVE'
                }
            });
            logger.log(`✅ Tenant Created: ${tenant.id}`);
            // 2. Create Admin User
            const password = await _bcrypt.hash('123456', 10);
            const user = await prisma.user.create({
                data: {
                    tenantId: tenant.id,
                    email,
                    username: email,
                    fullName: 'Admin User',
                    password,
                    role: 'ADMIN',
                    isActive: true,
                    isVerified: true
                }
            });
            logger.log(`✅ Admin User Created: ${user.id} (Pass: 123456)`);
            // 3. Create Default Warehouse
            await prisma.warehouse.create({
                data: {
                    tenantId: tenant.id,
                    code: 'WH001',
                    name: 'Merkez Depo',
                    isDefault: true,
                    address: 'Merkez'
                }
            });
            logger.log(`✅ Default Warehouse Created`);
            // 4. Create Code Templates
            const templates = [
                {
                    module: 'INVOICE',
                    prefix: 'FAT',
                    digitCount: 6
                },
                {
                    module: 'CUSTOMER',
                    prefix: 'CUSTOMER',
                    digitCount: 5
                },
                {
                    module: 'STOCK',
                    prefix: 'STK',
                    digitCount: 5
                }
            ];
            for (const t of templates){
                await prisma.codeTemplate.create({
                    data: {
                        tenantId: tenant.id,
                        module: t.module,
                        name: `${t.module} Şablon`,
                        prefix: t.prefix,
                        digitCount: t.digitCount,
                        currentValue: 0,
                        includeYear: true,
                        isActive: true
                    }
                });
            }
            logger.log(`✅ Code Templates Created`);
        });
        logger.log('🎉 Seeding Completed Successfully!');
    } catch (error) {
        logger.error('❌ Seeding Failed:', error);
    } finally{
        await app.close();
    }
}
bootstrap();

//# sourceMappingURL=seed-tenant.command.js.map