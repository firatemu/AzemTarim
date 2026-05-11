"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UpdateB2bTenantSyncDto", {
    enumerable: true,
    get: function() {
        return UpdateB2bTenantSyncDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _client = require("@prisma/client");
const _classtransformer = require("class-transformer");
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let UpdateB2bTenantSyncDto = class UpdateB2bTenantSyncDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        minimum: 5,
        maximum: 10080
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(5),
    (0, _classvalidator.Max)(10080),
    _ts_metadata("design:type", Number)
], UpdateB2bTenantSyncDto.prototype, "syncIntervalMinutes", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: _client.B2BOrderApprovalMode
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_client.B2BOrderApprovalMode),
    _ts_metadata("design:type", typeof _client.B2BOrderApprovalMode === "undefined" ? Object : _client.B2BOrderApprovalMode)
], UpdateB2bTenantSyncDto.prototype, "orderApprovalMode", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: _client.B2BErpAdapter
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(_client.B2BErpAdapter),
    _ts_metadata("design:type", typeof _client.B2BErpAdapter === "undefined" ? Object : _client.B2BErpAdapter)
], UpdateB2bTenantSyncDto.prototype, "erpAdapterType", void 0);

//# sourceMappingURL=update-b2b-tenant-sync.dto.js.map