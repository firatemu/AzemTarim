"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TechniciansService", {
    enumerable: true,
    get: function() {
        return TechniciansService;
    }
});
const _common = require("@nestjs/common");
const _crypto = /*#__PURE__*/ _interop_require_wildcard(require("crypto"));
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let TechniciansService = class TechniciansService {
    async findAll(search, limit = 100, page = 1) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const skip = (page - 1) * limit;
        const where = {
            role: 'TECHNICIAN'
        };
        if (tenantId) {
            where.tenantId = tenantId;
        }
        if (search) {
            where.OR = [
                {
                    fullName: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    department: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    fullName: true,
                    department: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    tenant: {
                        select: {
                            id: true,
                            name: true,
                            status: true
                        }
                    }
                },
                orderBy: {
                    fullName: 'asc'
                }
            }),
            this.prisma.user.count({
                where
            })
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async create(dto) {
        const tenantId = await this.tenantResolver.resolveForCreate({
            allowNull: false
        });
        const uniqueId = _crypto.randomBytes(4).toString('hex');
        const email = `t-${uniqueId}@servis.local`;
        const username = `teknisyen-${uniqueId}`;
        const rawPassword = dto.password ?? _crypto.randomBytes(12).toString('hex');
        const hashedPassword = await _bcrypt.hash(rawPassword, 10);
        return this.prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                fullName: dto.fullName,
                department: dto.department,
                phone: dto.phone,
                tenantId,
                role: 'TECHNICIAN',
                isActive: true
            },
            select: {
                id: true,
                fullName: true,
                department: true,
                role: true,
                isActive: true,
                createdAt: true,
                tenant: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
TechniciansService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], TechniciansService);

//# sourceMappingURL=technicians.service.js.map