"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InventoryCountController", {
    enumerable: true,
    get: function() {
        return InventoryCountController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _inventorycountservice = require("./inventory-count.service");
const _inventorycountexportservice = require("./inventory-count-export.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _createinventorycountdto = require("./dto/create-inventory-count.dto");
const _updateinventorycountdto = require("./dto/update-inventory-count.dto");
const _additemdto = require("./dto/add-item.dto");
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
const INVENTORY_COUNT_TYPE_QUERY = [
    'PRODUCT_BASED',
    'SHELF_BASED'
];
const INVENTORY_COUNT_STATUS_QUERY = [
    'DRAFT',
    'COMPLETED',
    'APPROVED',
    'CANCELLED'
];
let InventoryCountController = class InventoryCountController {
    findAll(countType, status) {
        return this.inventoryCountService.findAll(countType, status);
    }
    findProductByBarcode(barcode) {
        return this.inventoryCountService.findProductByBarcode(barcode);
    }
    findLocationByBarcode(barcode) {
        return this.inventoryCountService.findLocationByBarcode(barcode);
    }
    findOne(id) {
        return this.inventoryCountService.findOne(id);
    }
    create(createInventoryCountDto, user) {
        return this.inventoryCountService.create(createInventoryCountDto, user?.userId);
    }
    update(id, updateInventoryCountDto, user) {
        return this.inventoryCountService.update(id, updateInventoryCountDto, user?.userId);
    }
    remove(id) {
        return this.inventoryCountService.remove(id);
    }
    complete(id, user) {
        return this.inventoryCountService.complete(id, user?.userId);
    }
    approve(id, user) {
        return this.inventoryCountService.approve(id, user?.userId);
    }
    addItem(id, addItemDto) {
        return this.inventoryCountService.addItem(id, addItemDto);
    }
    async exportExcel(id, res) {
        const buffer = await this.inventoryCountExportService.generateExcel(id);
        const inventoryCount = await this.inventoryCountService.findOne(id);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="Inventory_Count_${inventoryCount.stocktakeNo}_${new Date().getTime()}.xlsx"`,
            'Content-Length': buffer.length
        });
        res.send(buffer);
    }
    async exportPdf(id, res) {
        const buffer = await this.inventoryCountExportService.generatePdf(id);
        const inventoryCount = await this.inventoryCountService.findOne(id);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Inventory_Count_${inventoryCount.stocktakeNo}_${new Date().getTime()}.pdf"`,
            'Content-Length': buffer.length
        });
        res.send(buffer);
    }
    constructor(inventoryCountService, inventoryCountExportService){
        this.inventoryCountService = inventoryCountService;
        this.inventoryCountExportService = inventoryCountExportService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiQuery)({
        name: 'countType',
        required: false,
        enum: INVENTORY_COUNT_TYPE_QUERY
    }),
    (0, _swagger.ApiQuery)({
        name: 'status',
        required: false,
        enum: INVENTORY_COUNT_STATUS_QUERY
    }),
    _ts_param(0, (0, _common.Query)('countType')),
    _ts_param(1, (0, _common.Query)('status')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InventoryCountController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('barcode/product/:barcode'),
    _ts_param(0, (0, _common.Param)('barcode')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InventoryCountController.prototype, "findProductByBarcode", null);
_ts_decorate([
    (0, _common.Get)('barcode/location/:barcode'),
    _ts_param(0, (0, _common.Param)('barcode')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InventoryCountController.prototype, "findLocationByBarcode", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InventoryCountController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createinventorycountdto.CreateInventoryCountDto === "undefined" ? Object : _createinventorycountdto.CreateInventoryCountDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], InventoryCountController.prototype, "create", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateinventorycountdto.UpdateInventoryCountDto === "undefined" ? Object : _updateinventorycountdto.UpdateInventoryCountDto,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], InventoryCountController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], InventoryCountController.prototype, "remove", null);
_ts_decorate([
    (0, _common.Put)(':id/complete'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], InventoryCountController.prototype, "complete", null);
_ts_decorate([
    (0, _common.Put)(':id/approve'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _currentuserdecorator.CurrentUser)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], InventoryCountController.prototype, "approve", null);
_ts_decorate([
    (0, _common.Post)(':id/item'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _additemdto.AddItemDto === "undefined" ? Object : _additemdto.AddItemDto
    ]),
    _ts_metadata("design:returntype", void 0)
], InventoryCountController.prototype, "addItem", null);
_ts_decorate([
    (0, _common.Get)(':id/export/excel'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], InventoryCountController.prototype, "exportExcel", null);
_ts_decorate([
    (0, _common.Get)(':id/export/pdf'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Res)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], InventoryCountController.prototype, "exportPdf", null);
InventoryCountController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('inventory-count'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _inventorycountservice.InventoryCountService === "undefined" ? Object : _inventorycountservice.InventoryCountService,
        typeof _inventorycountexportservice.InventoryCountExportService === "undefined" ? Object : _inventorycountexportservice.InventoryCountExportService
    ])
], InventoryCountController);

//# sourceMappingURL=inventory-count.controller.js.map