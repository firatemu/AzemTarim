"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "JournalEntryService", {
    enumerable: true,
    get: function() {
        return JournalEntryService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let JournalEntryService = class JournalEntryService {
    async findAll(page = 1, limit = 50, referenceType, referenceId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const skip = (page - 1) * limit;
        const where = (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined);
        if (referenceType) where.referenceType = referenceType;
        if (referenceId) where.referenceId = referenceId;
        const [data, total] = await Promise.all([
            this.prisma.journalEntry.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    entryDate: 'desc'
                },
                include: {
                    lines: true,
                    serviceInvoice: {
                        select: {
                            id: true,
                            invoiceNo: true,
                            grandTotal: true
                        }
                    }
                }
            }),
            this.prisma.journalEntry.count({
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
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const entry = await this.prisma.journalEntry.findFirst({
            where: {
                id,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                lines: true,
                serviceInvoice: {
                    include: {
                        workOrder: {
                            select: {
                                id: true,
                                workOrderNo: true
                            }
                        },
                        account: {
                            select: {
                                id: true,
                                code: true,
                                title: true
                            }
                        }
                    }
                }
            }
        });
        if (!entry) {
            throw new _common.NotFoundException(`Accounting record not found: ${id}`);
        }
        return entry;
    }
    async findByReference(referenceType, referenceId) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const entry = await this.prisma.journalEntry.findFirst({
            where: {
                referenceType,
                referenceId,
                ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
            },
            include: {
                lines: true,
                serviceInvoice: true
            }
        });
        if (!entry) {
            throw new _common.NotFoundException(`Accounting record not found: ${referenceType}/${referenceId}`);
        }
        return entry;
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
JournalEntryService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], JournalEntryService);

//# sourceMappingURL=journal-entry.service.js.map