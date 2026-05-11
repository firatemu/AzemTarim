"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CustomerVehicleController", {
    enumerable: true,
    get: function() {
        return CustomerVehicleController;
    }
});
const _common = require("@nestjs/common");
const _platformexpress = require("@nestjs/platform-express");
const _multer = require("multer");
const _fs = require("fs");
const _customervehicleservice = require("./customer-vehicle.service");
const _dto = require("./dto");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _fileuploadutils = require("../../common/utils/file-upload.utils");
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
let CustomerVehicleController = class CustomerVehicleController {
    async uploadRuhsatPhoto(file) {
        const url = `/api/uploads/ruhsat/${file.filename}`;
        return {
            url
        };
    }
    create(dto) {
        return this.customerVehicleService.create(dto);
    }
    findAll(page, limit, search, accountId) {
        return this.customerVehicleService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 50, search, accountId);
    }
    findOne(id) {
        return this.customerVehicleService.findOne(id);
    }
    update(id, dto) {
        return this.customerVehicleService.update(id, dto);
    }
    remove(id) {
        return this.customerVehicleService.remove(id);
    }
    constructor(customerVehicleService){
        this.customerVehicleService = customerVehicleService;
    }
};
_ts_decorate([
    (0, _common.Post)('upload-ruhsat'),
    (0, _common.UseInterceptors)((0, _platformexpress.FileInterceptor)('file', {
        storage: (0, _multer.diskStorage)({
            destination: (_req, _file, cb)=>{
                const dir = './uploads/ruhsat';
                if (!(0, _fs.existsSync)(dir)) (0, _fs.mkdirSync)(dir, {
                    recursive: true
                });
                cb(null, dir);
            },
            filename: _fileuploadutils.editFileName
        }),
        fileFilter: _fileuploadutils.imageFileFilter
    })),
    _ts_param(0, (0, _common.UploadedFile)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof Express === "undefined" || typeof Express.Multer === "undefined" || typeof Express.Multer.File === "undefined" ? Object : Express.Multer.File
    ]),
    _ts_metadata("design:returntype", Promise)
], CustomerVehicleController.prototype, "uploadRuhsatPhoto", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _dto.CreateCustomerVehicleDto === "undefined" ? Object : _dto.CreateCustomerVehicleDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CustomerVehicleController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('search')),
    _ts_param(3, (0, _common.Query)('accountId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CustomerVehicleController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CustomerVehicleController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _dto.UpdateCustomerVehicleDto === "undefined" ? Object : _dto.UpdateCustomerVehicleDto
    ]),
    _ts_metadata("design:returntype", void 0)
], CustomerVehicleController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CustomerVehicleController.prototype, "remove", null);
CustomerVehicleController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('customer-vehicles'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _customervehicleservice.CustomerVehicleService === "undefined" ? Object : _customervehicleservice.CustomerVehicleService
    ])
], CustomerVehicleController);

//# sourceMappingURL=customer-vehicle.controller.js.map