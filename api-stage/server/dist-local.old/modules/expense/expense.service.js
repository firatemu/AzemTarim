"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ExpenseService", {
    enumerable: true,
    get: function() {
        return ExpenseService;
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
let ExpenseService = class ExpenseService {
    async create(createDto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        // Category kontrolü
        const category = await this.prisma.expenseCategory.findUnique({
            where: {
                id: createDto.categoryId
            }
        });
        if (!category) {
            throw new _common.NotFoundException('Expense category not found');
        }
        return this.prisma.expense.create({
            data: {
                tenantId: tenantId,
                categoryId: createDto.categoryId,
                referenceNo: createDto.referenceNo?.trim() || null,
                notes: createDto.notes?.trim() || null,
                amount: createDto.amount,
                date: new Date(createDto.date),
                paymentType: createDto.paymentType || null
            },
            include: {
                category: true
            }
        });
    }
    async findAll(page = 1, limit = 50, categoryId, startDate, endDate) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const skip = (page - 1) * limit;
        const where = {
            ...(0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined)
        };
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }
        const [data, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                skip,
                take: limit,
                include: {
                    category: true
                },
                orderBy: {
                    date: 'desc'
                }
            }),
            this.prisma.expense.count({
                where
            })
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async findOne(id) {
        const expense = await this.prisma.expense.findUnique({
            where: {
                id
            },
            include: {
                category: true
            }
        });
        if (!expense) {
            throw new _common.NotFoundException('Expense record not found');
        }
        return expense;
    }
    async update(id, updateDto) {
        const existing = await this.prisma.expense.findUnique({
            where: {
                id
            }
        });
        if (!existing) {
            throw new _common.NotFoundException('Expense record not found');
        }
        const updateData = {
            ...updateDto
        };
        if (updateDto.date) {
            updateData.date = new Date(updateDto.date);
        }
        // Boş string'i null'a çevir (nullable field için)
        if (updateDto.notes !== undefined) {
            updateData.notes = updateDto.notes?.trim() || null;
        }
        return this.prisma.expense.update({
            where: {
                id
            },
            data: updateData,
            include: {
                category: true
            }
        });
    }
    async remove(id) {
        const existing = await this.prisma.expense.findUnique({
            where: {
                id
            }
        });
        if (!existing) {
            throw new _common.NotFoundException('Expense record not found');
        }
        return this.prisma.expense.delete({
            where: {
                id
            }
        });
    }
    async getStats(categoryId, startDate, endDate) {
        const where = {};
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }
        const [toplam, categoryBazli] = await Promise.all([
            this.prisma.expense.aggregate({
                where,
                _sum: {
                    amount: true
                },
                _count: true
            }),
            this.prisma.expenseCategory.findMany({
                include: {
                    _count: {
                        select: {
                            expenses: true
                        }
                    },
                    expenses: {
                        where,
                        select: {
                            amount: true
                        }
                    }
                }
            })
        ]);
        const categoryler = categoryBazli.map((k)=>({
                categoryId: k.id,
                name: k.name,
                adet: k._count.expenses,
                toplam: k.expenses.reduce((sum, m)=>sum + Number(m.amount), 0)
            }));
        return {
            toplamExpense: toplam._sum.amount || 0,
            toplamAdet: toplam._count,
            categoryler
        };
    }
    // Category işlemleri
    async findAllCategoryler() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.expenseCategory.findMany({
            where: (0, _stagingutil.buildTenantWhereClause)(tenantId ?? undefined),
            include: {
                _count: {
                    select: {
                        expenses: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    }
    async createCategory(name, notes) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        return this.prisma.expenseCategory.create({
            data: {
                tenantId: tenantId,
                name,
                notes
            }
        });
    }
    async updateCategory(id, name, notes) {
        const existing = await this.prisma.expenseCategory.findUnique({
            where: {
                id
            }
        });
        if (!existing) {
            throw new _common.NotFoundException('Category not found');
        }
        return this.prisma.expenseCategory.update({
            where: {
                id
            },
            data: {
                name,
                notes
            }
        });
    }
    async removeCategory(id) {
        const existing = await this.prisma.expenseCategory.findUnique({
            where: {
                id
            },
            include: {
                _count: {
                    select: {
                        expenses: true
                    }
                }
            }
        });
        if (!existing) {
            throw new _common.NotFoundException('Category not found');
        }
        if (existing._count.expenses > 0) {
            throw new _common.BadRequestException('Bu categoryde expense kayıtları var, silinemez');
        }
        return this.prisma.expenseCategory.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
ExpenseService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], ExpenseService);

//# sourceMappingURL=expense.service.js.map