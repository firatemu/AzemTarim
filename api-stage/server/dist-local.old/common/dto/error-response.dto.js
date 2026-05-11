"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ErrorResponseDto", {
    enumerable: true,
    get: function() {
        return ErrorResponseDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ErrorResponseDto = class ErrorResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Always false for error responses',
        example: false
    }),
    _ts_metadata("design:type", Boolean)
], ErrorResponseDto.prototype, "success", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'HTTP status code',
        example: _common.HttpStatus.NOT_FOUND
    }),
    _ts_metadata("design:type", Number)
], ErrorResponseDto.prototype, "statusCode", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'HTTP status name (e.g., NOT_FOUND, CONFLICT)',
        example: 'NOT_FOUND'
    }),
    _ts_metadata("design:type", String)
], ErrorResponseDto.prototype, "error", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Human-readable error message in Turkish',
        example: 'Invoice not found'
    }),
    _ts_metadata("design:type", String)
], ErrorResponseDto.prototype, "message", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'ISO 8601 timestamp',
        example: '2026-03-13T23:30:00.000Z'
    }),
    _ts_metadata("design:type", String)
], ErrorResponseDto.prototype, "timestamp", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Request path',
        example: '/api/invoices/123'
    }),
    _ts_metadata("design:type", String)
], ErrorResponseDto.prototype, "path", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Unique request ID for tracing',
        example: '550e8400-e29b-41d4-a716-446655440000'
    }),
    _ts_metadata("design:type", String)
], ErrorResponseDto.prototype, "requestId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Additional error details (e.g., risk limit excess amount)',
        example: {
            excessAmount: 5000,
            creditLimit: 10000
        },
        required: false
    }),
    _ts_metadata("design:type", typeof Record === "undefined" ? Object : Record)
], ErrorResponseDto.prototype, "details", void 0);

//# sourceMappingURL=error-response.dto.js.map