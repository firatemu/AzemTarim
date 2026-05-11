"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get B2bCustomerListQueryDto () {
        return B2bCustomerListQueryDto;
    },
    get B2bCustomerMovementsQueryDto () {
        return B2bCustomerMovementsQueryDto;
    },
    get B2bFifoPreviewQueryDto () {
        return B2bFifoPreviewQueryDto;
    },
    get CreateB2bCustomerDto () {
        return CreateB2bCustomerDto;
    },
    get UpdateB2bCustomerDto () {
        return UpdateB2bCustomerDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _classtransformer = require("class-transformer");
const _classvalidator = require("class-validator");
const _paginationquerydto = require("./pagination-query.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateB2bCustomerDto = class CreateB2bCustomerDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'ERP Account id (Account.id)'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateB2bCustomerDto.prototype, "erpAccountId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], CreateB2bCustomerDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateB2bCustomerDto.prototype, "password", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateB2bCustomerDto.prototype, "customerClassId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        default: 30
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    (0, _classvalidator.Max)(3650),
    _ts_metadata("design:type", Number)
], CreateB2bCustomerDto.prototype, "vatDays", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateB2bCustomerDto.prototype, "city", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateB2bCustomerDto.prototype, "district", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], CreateB2bCustomerDto.prototype, "canUseVirtualPos", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], CreateB2bCustomerDto.prototype, "blockOrderOnRisk", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateB2bCustomerDto.prototype, "customerGrade", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateB2bCustomerDto.prototype, "discountGroupId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateB2bCustomerDto.prototype, "salespersonId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    _ts_metadata("design:type", Number)
], CreateB2bCustomerDto.prototype, "erpNum", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateB2bCustomerDto.prototype, "name", void 0);
let UpdateB2bCustomerDto = class UpdateB2bCustomerDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], UpdateB2bCustomerDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], UpdateB2bCustomerDto.prototype, "isActive", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", Object)
], UpdateB2bCustomerDto.prototype, "customerClassId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    (0, _classvalidator.Max)(3650),
    _ts_metadata("design:type", Number)
], UpdateB2bCustomerDto.prototype, "vatDays", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateB2bCustomerDto.prototype, "city", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateB2bCustomerDto.prototype, "district", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], UpdateB2bCustomerDto.prototype, "canUseVirtualPos", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], UpdateB2bCustomerDto.prototype, "blockOrderOnRisk", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateB2bCustomerDto.prototype, "customerGrade", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateB2bCustomerDto.prototype, "discountGroupId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateB2bCustomerDto.prototype, "salespersonId", void 0);
let B2bCustomerListQueryDto = class B2bCustomerListQueryDto extends _paginationquerydto.PaginationQueryDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], B2bCustomerListQueryDto.prototype, "search", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: [
            'name',
            'createdAt',
            'balance'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsIn)([
        'name',
        'createdAt',
        'balance'
    ]),
    _ts_metadata("design:type", String)
], B2bCustomerListQueryDto.prototype, "sortBy", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: [
            'asc',
            'desc'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsIn)([
        'asc',
        'desc'
    ]),
    _ts_metadata("design:type", String)
], B2bCustomerListQueryDto.prototype, "sortOrder", void 0);
let B2bCustomerMovementsQueryDto = class B2bCustomerMovementsQueryDto extends _paginationquerydto.PaginationQueryDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], B2bCustomerMovementsQueryDto.prototype, "from", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], B2bCustomerMovementsQueryDto.prototype, "to", void 0);
let B2bFifoPreviewQueryDto = class B2bFifoPreviewQueryDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'FIFO "bugün" referansı (ISO 8601). Boşsa sunucu zamanı kullanılır.'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], B2bFifoPreviewQueryDto.prototype, "asOf", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: [
            'json',
            'xlsx',
            'pdf'
        ],
        default: 'json',
        description: 'json: API gövdesi; xlsx / pdf: indirilebilir dosya'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsIn)([
        'json',
        'xlsx',
        'pdf'
    ]),
    _ts_metadata("design:type", String)
], B2bFifoPreviewQueryDto.prototype, "format", void 0);

//# sourceMappingURL=b2b-customer.dto.js.map