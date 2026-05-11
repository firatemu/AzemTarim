"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CompanyCreditCardService", {
    enumerable: true,
    get: function() {
        return CompanyCreditCardService;
    }
});
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CompanyCreditCardService = class CompanyCreditCardService {
    async create(createDto) {
        // Cashbox kontrolü
        const cashbox = await this.prisma.cashbox.findUnique({
            where: {
                id: createDto.cashboxId
            }
        });
        if (!cashbox) {
            throw new _common.NotFoundException('Cashbox not found');
        }
        if (cashbox.type !== 'COMPANY_CREDIT_CARD') {
            throw new _common.BadRequestException('Cards can only be added to cashboxes of type COMPANY_CREDIT_CARD');
        }
        // Kart kodu kontrolü veya otomatik üret
        let code = createDto.code;
        if (!code || code.trim() === '') {
            // Otomatik kod üret: KASA_KODU-001, KASA_KODU-002...
            const kartSayisi = await this.prisma.companyCreditCard.count({
                where: {
                    cashboxId: createDto.cashboxId
                }
            });
            code = `${cashbox.code}-${String(kartSayisi + 1).padStart(3, '0')}`;
        }
        const data = {
            cashboxId: createDto.cashboxId,
            code,
            name: createDto.name,
            bankName: createDto.bankName,
            cardType: createDto.cardType,
            lastFourDigits: createDto.lastFourDigits,
            creditLimit: createDto.creditLimit,
            statementDate: createDto.statementDate ? new Date(createDto.statementDate) : null,
            paymentDueDate: createDto.paymentDueDate ? new Date(createDto.paymentDueDate) : null,
            isActive: createDto.isActive ?? true
        };
        const kart = await this.prisma.companyCreditCard.create({
            data,
            include: {
                cashbox: true
            }
        });
        return kart;
    }
    async findAll(cashboxId) {
        const where = {};
        if (cashboxId) {
            where.cashboxId = cashboxId;
        }
        return this.prisma.companyCreditCard.findMany({
            where,
            include: {
                cashbox: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }
    async findOne(id) {
        const kart = await this.prisma.companyCreditCard.findUnique({
            where: {
                id
            },
            include: {
                cashbox: true,
                movements: {
                    include: {
                        account: {
                            select: {
                                id: true,
                                code: true,
                                title: true
                            }
                        }
                    },
                    orderBy: {
                        date: 'desc'
                    },
                    take: 50
                }
            }
        });
        if (!kart) {
            throw new _common.NotFoundException('Company credit card not found');
        }
        return kart;
    }
    async update(id, updateDto) {
        await this.findOne(id);
        // cashboxId burada olmamalı - update'te cashbox değiştirilemez
        const { cashboxId, ...updateData } = updateDto;
        if (cashboxId !== undefined) {
            throw new _common.BadRequestException('Cashbox cannot be changed. Please do not send the cashboxId field.');
        }
        // Tarih alanlarını Date'e çevir
        const dataToUpdate = {
            ...updateData
        };
        if (updateDto.statementDate !== undefined) {
            dataToUpdate.statementDate = updateDto.statementDate ? new Date(updateDto.statementDate) : null;
        }
        if (updateDto.paymentDueDate !== undefined) {
            dataToUpdate.paymentDueDate = updateDto.paymentDueDate ? new Date(updateDto.paymentDueDate) : null;
        }
        const kart = await this.prisma.companyCreditCard.update({
            where: {
                id
            },
            data: dataToUpdate
        });
        return kart;
    }
    async remove(id) {
        const kart = await this.findOne(id);
        // Hareket kontrolü
        const hareketSayisi = await this.prisma.companyCreditCardMovement.count({
            where: {
                cardId: id
            }
        });
        if (hareketSayisi > 0) {
            throw new _common.BadRequestException('This card has movements, it cannot be deleted');
        }
        return this.prisma.companyCreditCard.delete({
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
CompanyCreditCardService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], CompanyCreditCardService);

//# sourceMappingURL=company-credit-card.service.js.map