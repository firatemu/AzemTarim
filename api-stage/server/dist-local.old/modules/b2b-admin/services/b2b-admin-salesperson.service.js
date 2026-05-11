"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "B2bAdminSalespersonService", {
    enumerable: true,
    get: function() {
        return B2bAdminSalespersonService;
    }
});
const _common = require("@nestjs/common");
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
const _client = require("@prisma/client");
const _prismaservice = require("../../../common/prisma.service");
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
let B2bAdminSalespersonService = class B2bAdminSalespersonService {
    paginate(data, total, page, limit) {
        return {
            data,
            total,
            page,
            limit
        };
    }
    async list(tenantId) {
        // Kendi ERP'miz kullanılırken satış elemanlarını Employee tablosundan çek
        const employees = await this.prisma.employee.findMany({
            where: {
                tenantId,
                isActive: true
            },
            select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
            },
            orderBy: {
                firstName: 'asc'
            }
        });
        // Employee verilerini B2BSalesperson formatına dönüştür
        return employees.map((emp)=>({
                id: emp.id,
                name: `${emp.firstName} ${emp.lastName}`.trim(),
                email: emp.email,
                employeeCode: emp.employeeCode,
                phone: emp.phone,
                isActive: true,
                canViewAllCustomers: false,
                canViewAllReports: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                tenantId
            }));
    }
    async create(tenantId, dto) {
        const passwordHash = await _bcrypt.hash(dto.password, 10);
        try {
            return await this.prisma.b2BSalesperson.create({
                data: {
                    tenantId,
                    name: dto.name,
                    email: dto.email,
                    passwordHash,
                    canViewAllCustomers: dto.canViewAllCustomers ?? false,
                    canViewAllReports: dto.canViewAllReports ?? false
                }
            });
        } catch (e) {
            if (e instanceof _client.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new _common.ConflictException('Salesperson email already exists');
            }
            throw e;
        }
    }
    async update(tenantId, id, dto) {
        const existing = await this.prisma.b2BSalesperson.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!existing) throw new _common.NotFoundException('Salesperson not found');
        const data = {
            ...dto.name != null && {
                name: dto.name
            },
            ...dto.email != null && {
                email: dto.email
            },
            ...dto.isActive != null && {
                isActive: dto.isActive
            },
            ...dto.canViewAllCustomers != null && {
                canViewAllCustomers: dto.canViewAllCustomers
            },
            ...dto.canViewAllReports != null && {
                canViewAllReports: dto.canViewAllReports
            }
        };
        if (dto.password) {
            data.passwordHash = await _bcrypt.hash(dto.password, 10);
        }
        try {
            return await this.prisma.b2BSalesperson.update({
                where: {
                    id
                },
                data
            });
        } catch (e) {
            if (e instanceof _client.Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new _common.ConflictException('Salesperson email already exists');
            }
            throw e;
        }
    }
    async assignCustomers(tenantId, salespersonId, dto) {
        const sp = await this.prisma.b2BSalesperson.findFirst({
            where: {
                id: salespersonId,
                tenantId
            }
        });
        if (!sp) throw new _common.NotFoundException('Salesperson not found');
        await this.prisma.$transaction(async (tx)=>{
            for (const customerId of dto.customerIds){
                const c = await tx.b2BCustomer.findFirst({
                    where: {
                        id: customerId,
                        tenantId
                    }
                });
                if (!c) {
                    throw new _common.NotFoundException(`Customer ${customerId} not found`);
                }
            }
            await tx.b2BSalespersonCustomer.createMany({
                data: dto.customerIds.map((customerId)=>({
                        salespersonId,
                        customerId
                    })),
                skipDuplicates: true
            });
        });
        return {
            ok: true,
            assigned: dto.customerIds.length
        };
    }
    async removeCustomer(tenantId, salespersonId, customerId) {
        const sp = await this.prisma.b2BSalesperson.findFirst({
            where: {
                id: salespersonId,
                tenantId
            }
        });
        if (!sp) throw new _common.NotFoundException('Salesperson not found');
        await this.prisma.b2BSalespersonCustomer.deleteMany({
            where: {
                salespersonId,
                customerId
            }
        });
        return {
            ok: true
        };
    }
    async listCustomers(tenantId, salespersonId, page, limit) {
        const sp = await this.prisma.b2BSalesperson.findFirst({
            where: {
                id: salespersonId,
                tenantId
            }
        });
        if (!sp) throw new _common.NotFoundException('Salesperson not found');
        const skip = (page - 1) * limit;
        const where = {
            salespersonId
        };
        const [total, links] = await Promise.all([
            this.prisma.b2BSalespersonCustomer.count({
                where
            }),
            this.prisma.b2BSalespersonCustomer.findMany({
                where,
                skip,
                take: limit,
                include: {
                    customer: {
                        include: {
                            customerClass: true
                        }
                    }
                },
                orderBy: {
                    assignedAt: 'desc'
                }
            })
        ]);
        return this.paginate(links.map((l)=>l.customer), total, page, limit);
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
B2bAdminSalespersonService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], B2bAdminSalespersonService);

//# sourceMappingURL=b2b-admin-salesperson.service.js.map