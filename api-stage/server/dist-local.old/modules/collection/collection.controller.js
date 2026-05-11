"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CollectionController", {
    enumerable: true,
    get: function() {
        return CollectionController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _collectionservice = require("./collection.service");
const _collectionexportservice = require("./collection-export.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createcollectiondto = require("./dto/create-collection.dto");
const _createcrosspaymentdto = require("./dto/create-cross-payment.dto");
const _currentuserdecorator = require("../../common/decorators/current-user.decorator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
const COLLECTION_TYPE_QUERY = [
    'COLLECTION',
    'PAYMENT'
];
const PAYMENT_METHOD_QUERY = [
    'CASH',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'CHECK',
    'PROMISSORY_NOTE'
];
let CollectionController = class CollectionController {
    create(dto, user) {
        return this.collectionService.create(dto, user.userId);
    }
    createCrossPayment(dto, user) {
        return this.collectionService.createCrossPayment(dto, user.userId);
    }
    findAll(page = 1, limit = 50, type, paymentMethod, accountId, startDate, endDate, cashboxId, bankAccountId, companyCreditCardId) {
        return this.collectionService.findAll(page, limit, type, paymentMethod, accountId, startDate, endDate, cashboxId, bankAccountId, companyCreditCardId);
    }
    getStats() {
        return this.collectionService.getStats();
    }
    findOne(id) {
        return this.collectionService.findOne(id);
    }
    delete(id) {
        return this.collectionService.delete(id);
    }
    constructor(collectionService, collectionExportService){
        this.collectionService = collectionService;
        this.collectionExportService = collectionExportService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcollectiondto.CreateCollectionDto === "undefined" ? Object : _createcollectiondto.CreateCollectionDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], CollectionController.prototype, "create", null);
_ts_decorate([
    (0, _common.Post)('capraz-odeme'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcrosspaymentdto.CreateCrossPaymentDto === "undefined" ? Object : _createcrosspaymentdto.CreateCrossPaymentDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], CollectionController.prototype, "createCrossPayment", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiQuery)({
        name: 'type',
        required: false,
        enum: COLLECTION_TYPE_QUERY
    }),
    (0, _swagger.ApiQuery)({
        name: 'paymentMethod',
        required: false,
        enum: PAYMENT_METHOD_QUERY
    }),
    _ts_param(0, (0, _common.Query)('page', _common.ParseIntPipe)),
    _ts_param(1, (0, _common.Query)('limit', _common.ParseIntPipe)),
    _ts_param(2, (0, _common.Query)('type')),
    _ts_param(3, (0, _common.Query)('paymentMethod')),
    _ts_param(4, (0, _common.Query)('accountId')),
    _ts_param(5, (0, _common.Query)('startDate')),
    _ts_param(6, (0, _common.Query)('endDate')),
    _ts_param(7, (0, _common.Query)('cashboxId')),
    _ts_param(8, (0, _common.Query)('bankAccountId')),
    _ts_param(9, (0, _common.Query)('companyCreditCardId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        void 0,
        String,
        String,
        String,
        String,
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CollectionController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('stats'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CollectionController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CollectionController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CollectionController.prototype, "delete", null);
CollectionController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('collections'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _collectionservice.CollectionService === "undefined" ? Object : _collectionservice.CollectionService,
        typeof _collectionexportservice.CollectionExportService === "undefined" ? Object : _collectionexportservice.CollectionExportService
    ])
], CollectionController);

//# sourceMappingURL=collection.controller.js.map