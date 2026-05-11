"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "QuoteController", {
    enumerable: true,
    get: function() {
        return QuoteController;
    }
});
const _common = require("@nestjs/common");
const _quoteservice = require("./quote.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createquotedto = require("./dto/create-quote.dto");
const _updatequotedto = require("./dto/update-quote.dto");
const _queryquotedto = require("./dto/query-quote.dto");
const _swagger = require("@nestjs/swagger");
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
let QuoteController = class QuoteController {
    findAll(query) {
        return this.quoteService.findAll(query.page ? parseInt(query.page) : 1, query.limit ? parseInt(query.limit) : 50, query.type, query.search, query.accountId);
    }
    findOne(id) {
        return this.quoteService.findOne(id);
    }
    create(createQuoteDto, user, req) {
        return this.quoteService.create(createQuoteDto, user?.userId, req.ip, req.headers['user-agent']);
    }
    update(id, updateQuoteDto, user, req) {
        return this.quoteService.update(id, updateQuoteDto, user?.userId, req.ip, req.headers['user-agent']);
    }
    remove(id, user, req) {
        return this.quoteService.remove(id, user?.userId, req.ip, req.headers['user-agent']);
    }
    changeStatus(id, status, user, req) {
        return this.quoteService.changeStatus(id, status, user?.userId, req.ip, req.headers['user-agent']);
    }
    convertToOrder(id, user, req) {
        return this.quoteService.convertToOrder(id, user?.userId, req.ip, req.headers['user-agent']);
    }
    constructor(quoteService){
        this.quoteService = quoteService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _queryquotedto.QueryQuoteDto === "undefined" ? Object : _queryquotedto.QueryQuoteDto
    ]),
    _ts_metadata("design:returntype", void 0)
], QuoteController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], QuoteController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createquotedto.CreateQuoteDto === "undefined" ? Object : _createquotedto.CreateQuoteDto,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], QuoteController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(3, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatequotedto.UpdateQuoteDto === "undefined" ? Object : _updatequotedto.UpdateQuoteDto,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], QuoteController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], QuoteController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Put)(':id/status'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)('status')),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(3, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], QuoteController.prototype, "changeStatus", null);
_ts_decorate([
    (0, _common.Post)(':id/convert-to-order'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], QuoteController.prototype, "convertToOrder", null);
QuoteController = _ts_decorate([
    (0, _swagger.ApiTags)('Quotes'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('quotes'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _quoteservice.QuoteService === "undefined" ? Object : _quoteservice.QuoteService
    ])
], QuoteController);

//# sourceMappingURL=quote.controller.js.map