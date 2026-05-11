"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CodeTemplateService", {
    enumerable: true,
    get: function() {
        return CodeTemplateService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../common/prisma.service");
const _tenantresolverservice = require("../../common/services/tenant-resolver.service");
const _stagingutil = require("../../common/utils/staging.util");
const _codetemplateenums = require("./code-template.enums");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const DEFAULT_TEMPLATES = {
    [_codetemplateenums.ModuleType.WAREHOUSE]: {
        name: 'Depo Kodu',
        prefix: 'D',
        digitCount: 3
    },
    [_codetemplateenums.ModuleType.CASHBOX]: {
        name: 'Kasa Kodu',
        prefix: 'K',
        digitCount: 3
    },
    [_codetemplateenums.ModuleType.PERSONNEL]: {
        name: 'Personel Kodu',
        prefix: 'P',
        digitCount: 4
    },
    [_codetemplateenums.ModuleType.PRODUCT]: {
        name: 'Ürün Kodu',
        prefix: 'ST',
        digitCount: 4
    },
    [_codetemplateenums.ModuleType.CUSTOMER]: {
        name: 'Cari Kodu',
        prefix: 'C',
        digitCount: 4
    },
    [_codetemplateenums.ModuleType.INVOICE_SALES]: {
        name: 'Satış Faturası No',
        prefix: 'SF',
        digitCount: 5
    },
    [_codetemplateenums.ModuleType.INVOICE_PURCHASE]: {
        name: 'Alış Faturası No',
        prefix: 'AF',
        digitCount: 5
    },
    [_codetemplateenums.ModuleType.ORDER_SALES]: {
        name: 'Satış Siparişi No',
        prefix: 'SS',
        digitCount: 5
    },
    [_codetemplateenums.ModuleType.ORDER_PURCHASE]: {
        name: 'Satın Alma Siparişi No',
        prefix: 'SA',
        digitCount: 5
    },
    [_codetemplateenums.ModuleType.INVENTORY_COUNT]: {
        name: 'Sayım No',
        prefix: 'SY',
        digitCount: 5
    },
    [_codetemplateenums.ModuleType.QUOTE]: {
        name: 'Teklif No',
        prefix: 'TK',
        digitCount: 5
    },
    [_codetemplateenums.ModuleType.DELIVERY_NOTE_SALES]: {
        name: 'Satış İrsaliyesi No',
        prefix: 'Sİ',
        digitCount: 5
    },
    [_codetemplateenums.ModuleType.DELIVERY_NOTE_PURCHASE]: {
        name: 'Alış İrsaliyesi No',
        prefix: 'Aİ',
        digitCount: 5
    },
    [_codetemplateenums.ModuleType.TECHNICIAN]: {
        name: 'Teknisyen Kodu',
        prefix: 'T',
        digitCount: 3
    },
    [_codetemplateenums.ModuleType.WORK_ORDER]: {
        name: 'İş Emri No',
        prefix: 'IE',
        digitCount: 5
    },
    [_codetemplateenums.ModuleType.SERVICE_INVOICE]: {
        name: 'Servis Faturası No',
        prefix: 'SF',
        digitCount: 5
    },
    [_codetemplateenums.ModuleType.POS_CONSOLE]: {
        name: 'POS İşlem No',
        prefix: 'POS',
        digitCount: 5
    },
    [_codetemplateenums.ModuleType.CHECK_BILL_JOURNAL]: {
        name: 'Bordro Numaralandırma',
        prefix: 'BRD',
        digitCount: 6
    },
    [_codetemplateenums.ModuleType.CHECK_BILL_DOCUMENT]: {
        name: 'Çek/Senet No',
        prefix: 'EVR',
        digitCount: 6
    }
};
let CodeTemplateService = class CodeTemplateService {
    async create(createDto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        // Check if template already exists for this module and tenant
        const existing = await this.prisma.codeTemplate.findFirst({
            where: {
                module: createDto.module,
                tenantId
            }
        });
        if (existing) {
            throw new _common.ConflictException(`Bu modül için zaten bir şablon mevcut: ${createDto.module}`);
        }
        return this.prisma.codeTemplate.create({
            data: {
                tenantId,
                module: createDto.module,
                name: createDto.name,
                prefix: createDto.prefix,
                digitCount: createDto.digitCount,
                currentValue: createDto.currentValue || 0,
                includeYear: createDto.includeYear !== undefined ? createDto.includeYear : false,
                isActive: createDto.isActive !== undefined ? createDto.isActive : true
            }
        });
    }
    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.codeTemplate.findMany({
            where: {
                tenantId
            },
            orderBy: {
                module: 'asc'
            }
        });
    }
    async findOne(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const template = await this.prisma.codeTemplate.findFirst({
            where: {
                id,
                tenantId
            }
        });
        if (!template) {
            throw new _common.NotFoundException(`Template not found: id`);
        }
        return template;
    }
    async findByModule(module) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const template = await this.prisma.codeTemplate.findFirst({
            where: {
                module,
                tenantId
            }
        });
        if (!template) {
            throw new _common.NotFoundException(`Template not found for this module: module`);
        }
        return template;
    }
    async update(id, updateDto) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const existing = await this.findOne(id);
        return this.prisma.codeTemplate.update({
            where: {
                id: existing.id,
                tenantId
            },
            data: {
                name: updateDto.name,
                prefix: updateDto.prefix,
                digitCount: updateDto.digitCount,
                currentValue: updateDto.currentValue,
                includeYear: updateDto.includeYear,
                isActive: updateDto.isActive
            }
        });
    }
    async remove(id) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const existing = await this.findOne(id);
        return this.prisma.codeTemplate.delete({
            where: {
                id: existing.id,
                tenantId
            }
        });
    }
    /**
   * Modül tipine göre veritabanında kodun kullanılıp kullanılmadığını kontrol eder.
   */ async isCodeUsed(module, code, tenantId) {
        const mapping = {
            [_codetemplateenums.ModuleType.INVOICE_SALES]: {
                model: 'invoice',
                field: 'invoiceNo'
            },
            [_codetemplateenums.ModuleType.INVOICE_PURCHASE]: {
                model: 'invoice',
                field: 'invoiceNo'
            },
            [_codetemplateenums.ModuleType.SERVICE_INVOICE]: {
                model: 'invoice',
                field: 'invoiceNo'
            },
            [_codetemplateenums.ModuleType.ORDER_SALES]: {
                model: 'salesOrder',
                field: 'orderNo'
            },
            [_codetemplateenums.ModuleType.ORDER_PURCHASE]: {
                model: 'purchaseOrder',
                field: 'orderNo'
            },
            [_codetemplateenums.ModuleType.DELIVERY_NOTE_SALES]: {
                model: 'salesDeliveryNote',
                field: 'deliveryNoteNo'
            },
            [_codetemplateenums.ModuleType.DELIVERY_NOTE_PURCHASE]: {
                model: 'purchaseDeliveryNote',
                field: 'deliveryNoteNo'
            },
            [_codetemplateenums.ModuleType.PRODUCT]: {
                model: 'product',
                field: 'code'
            },
            [_codetemplateenums.ModuleType.CUSTOMER]: {
                model: 'account',
                field: 'code'
            },
            [_codetemplateenums.ModuleType.WAREHOUSE]: {
                model: 'warehouse',
                field: 'code'
            },
            [_codetemplateenums.ModuleType.CASHBOX]: {
                model: 'cashbox',
                field: 'code'
            },
            [_codetemplateenums.ModuleType.PERSONNEL]: {
                model: 'employee',
                field: 'code'
            },
            [_codetemplateenums.ModuleType.WORK_ORDER]: {
                model: 'workOrder',
                field: 'workOrderNo'
            },
            [_codetemplateenums.ModuleType.QUOTE]: {
                model: 'quote',
                field: 'quoteNo'
            },
            [_codetemplateenums.ModuleType.CHECK_BILL_JOURNAL]: {
                model: 'checkBillJournal',
                field: 'journalNo'
            },
            [_codetemplateenums.ModuleType.CHECK_BILL_DOCUMENT]: {
                model: 'checkBill',
                field: 'checkNo'
            }
        };
        const config = mapping[module];
        if (!config) return false;
        try {
            const model = this.prisma[config.model];
            if (!model) return false;
            const count = await model.count({
                where: {
                    [config.field]: code,
                    ...(0, _stagingutil.buildTenantWhereClause)(tenantId || undefined)
                }
            });
            return count > 0;
        } catch (error) {
            console.error(`[CodeTemplateService] isCodeUsed error for ${module}:`, error);
            return false;
        }
    }
    async getNextCode(module) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        try {
            let template = await this.prisma.codeTemplate.findFirst({
                where: {
                    module,
                    tenantId
                }
            });
            if (!template) {
                const defaults = DEFAULT_TEMPLATES[module];
                if (defaults) {
                    template = await this.prisma.codeTemplate.create({
                        data: {
                            tenantId,
                            module,
                            name: defaults.name,
                            prefix: defaults.prefix,
                            digitCount: defaults.digitCount,
                            currentValue: 0,
                            includeYear: false,
                            isActive: true
                        }
                    });
                } else {
                    throw new _common.NotFoundException(`Bu modül için şablon tanımlanmamış: ${module}`);
                }
            }
            if (!template.isActive) {
                throw new _common.BadRequestException(`Bu modül için şablon aktif değil: ${module}`);
            }
            let nextCode = '';
            let nextNumber;
            let isUsed = true;
            let attempts = 0;
            // Kullanılmayan bir kod bulana kadar döngü (max 100 deneme)
            while(isUsed && attempts < 100){
                attempts++;
                nextNumber = template.currentValue + 1;
                const paddedNumber = String(nextNumber).padStart(template.digitCount, '0');
                if (template.includeYear) {
                    const currentYear = new Date().getFullYear();
                    nextCode = `${template.prefix}${currentYear}${paddedNumber}`;
                } else {
                    nextCode = `${template.prefix}${paddedNumber}`;
                }
                // Kontrol et
                isUsed = await this.isCodeUsed(module, nextCode, tenantId);
                if (isUsed) {
                    // Eğer kod kullanılmışsa sayacı hemen güncelle ve bir sonrakini dene
                    template = await this.prisma.codeTemplate.update({
                        where: {
                            id: template.id
                        },
                        data: {
                            currentValue: nextNumber
                        }
                    });
                    console.warn(`⚠️ [CodeTemplateService] ${nextCode} kullanımda, sayaç ${nextNumber} değerine atlandı.`);
                }
            }
            // Sayacı resmi olarak güncelle
            const updated = await this.prisma.codeTemplate.update({
                where: {
                    id: template.id
                },
                data: {
                    currentValue: template.currentValue + 1
                }
            });
            const finalNumber = updated.currentValue;
            const paddedFinal = String(finalNumber).padStart(template.digitCount, '0');
            let finalCode;
            if (template.includeYear) {
                const currentYear = new Date().getFullYear();
                finalCode = `${template.prefix}${currentYear}${paddedFinal}`;
            } else {
                finalCode = `${template.prefix}${paddedFinal}`;
            }
            return finalCode;
        } catch (error) {
            console.error('❌ [CodeTemplate Service] getNextCode hatası:', error);
            if (error instanceof _common.NotFoundException || error instanceof _common.BadRequestException) {
                throw error;
            }
            throw new _common.BadRequestException(error?.message || `Kod üretilirken hata oluştu: ${module}`);
        }
    }
    async getPreviewCode(module) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        try {
            let template = await this.prisma.codeTemplate.findFirst({
                where: {
                    module,
                    tenantId
                }
            });
            if (!template) {
                const defaults = DEFAULT_TEMPLATES[module];
                if (defaults) {
                    template = await this.prisma.codeTemplate.create({
                        data: {
                            tenantId,
                            module,
                            name: defaults.name,
                            prefix: defaults.prefix,
                            digitCount: defaults.digitCount,
                            currentValue: 0,
                            includeYear: false,
                            isActive: true
                        }
                    });
                } else {
                    throw new _common.NotFoundException(`Bu modül için şablon tanımlanmamış: ${module}`);
                }
            }
            let nextCode = '';
            let nextNumber;
            let isUsed = true;
            let attempts = 0;
            let currentValForPreview = template.currentValue;
            // Önizleme için de kullanılmayan bir kod bulana kadar bak
            while(isUsed && attempts < 100){
                attempts++;
                nextNumber = currentValForPreview + 1;
                const paddedNumber = String(nextNumber).padStart(template.digitCount, '0');
                if (template.includeYear) {
                    const currentYear = new Date().getFullYear();
                    nextCode = `${template.prefix}${currentYear}${paddedNumber}`;
                } else {
                    nextCode = `${template.prefix}${paddedNumber}`;
                }
                isUsed = await this.isCodeUsed(module, nextCode, tenantId);
                if (isUsed) {
                    currentValForPreview = nextNumber;
                }
            }
            return nextCode;
        } catch (error) {
            console.error('❌ [CodeTemplate Service] getPreviewCode hatası:', error);
            throw error;
        }
    }
    async resetCounter(module, newValue) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const template = await this.prisma.codeTemplate.findFirst({
            where: {
                module,
                tenantId
            }
        });
        if (!template) {
            throw new _common.NotFoundException(`Template not found for module: ${module}`);
        }
        const next = newValue !== undefined && Number.isFinite(newValue) ? Math.max(0, Math.floor(newValue)) : 0;
        return this.prisma.codeTemplate.update({
            where: {
                id: template.id
            },
            data: {
                currentValue: next
            }
        });
    }
    /**
   * Bir kodun kaydedilmesi durumunda son değeri günceller.
   * Eğer girilen kodun sonundaki sayı, mevcut sayaçtan büyükse sayacı günceller.
   */ async saveLastCode(module, code) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        try {
            const template = await this.prisma.codeTemplate.findFirst({
                where: {
                    module,
                    tenantId
                }
            });
            if (!template || !code) return;
            // Prefix + Year (opsiyonel) sonrasındaki sayı kısmını al
            const lastNumberStr = template.includeYear ? code.substring(template.prefix.length + 4) : code.substring(template.prefix.length);
            const lastNumber = parseInt(lastNumberStr, 10);
            if (isNaN(lastNumber)) {
                return;
            }
            // Sadece daha büyük bir numara gelirse güncelle
            if (lastNumber > template.currentValue) {
                await this.prisma.codeTemplate.update({
                    where: {
                        id: template.id
                    },
                    data: {
                        currentValue: lastNumber
                    }
                });
                console.log(`✅ [CodeTemplate Service] Sayaç güncellendi: ${module} -> ${lastNumber}`);
            }
        } catch (error) {
            console.error('❌ [CodeTemplate Service] saveLastCode hatası:', error);
        }
    }
    constructor(prisma, tenantResolver){
        this.prisma = prisma;
        this.tenantResolver = tenantResolver;
    }
};
CodeTemplateService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _tenantresolverservice.TenantResolverService === "undefined" ? Object : _tenantresolverservice.TenantResolverService
    ])
], CodeTemplateService);

//# sourceMappingURL=code-template.service.js.map