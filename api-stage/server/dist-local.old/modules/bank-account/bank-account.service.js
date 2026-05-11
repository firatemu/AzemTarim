"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BankAccountService", {
    enumerable: true,
    get: function() {
        return BankAccountService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantcontextservice = require("../../common/services/tenant-context.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let BankAccountService = class BankAccountService {
    async create(createDto) {
        return this.prisma.bankAccount.create({
            data: {
                bankId: createDto.bankId,
                code: createDto.code || `ACC-${Date.now()}`,
                name: createDto.name,
                accountNo: createDto.accountNo,
                iban: createDto.iban,
                type: createDto.type,
                isActive: createDto.isActive ?? true
            }
        });
    }
    async findAll(bankId, type) {
        const tenantId = this.tenantContext.getTenantId();
        return this.prisma.bankAccount.findMany({
            where: {
                bank: {
                    tenantId: tenantId
                },
                bankId: bankId,
                type: type,
                isActive: true
            },
            include: {
                bank: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async findOne(id) {
        const tenantId = this.tenantContext.getTenantId();
        const hesap = await this.prisma.bankAccount.findFirst({
            where: {
                id,
                bank: {
                    tenantId: tenantId
                }
            },
            include: {
                bank: true
            }
        });
        if (!hesap) {
            throw new _common.NotFoundException('Bank account not found');
        }
        return hesap;
    }
    async update(id, updateDto) {
        await this.findOne(id);
        return this.prisma.bankAccount.update({
            where: {
                id
            },
            data: {
                name: updateDto.name,
                accountNo: updateDto.accountNo,
                iban: updateDto.iban,
                isActive: updateDto.isActive
            }
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.bankAccount.update({
            where: {
                id
            },
            data: {
                isActive: false
            }
        });
    }
    constructor(prisma, tenantContext, tenantResolver){
        this.prisma = prisma;
        this.tenantContext = tenantContext;
        this.tenantResolver = tenantResolver;
    }
};
BankAccountService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantcontextservice.TenantContextService === "undefined" ? Object : _tenantcontextservice.TenantContextService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], BankAccountService);

//# sourceMappingURL=bank-account.service.js.map