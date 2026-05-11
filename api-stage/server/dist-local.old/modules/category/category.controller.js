"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CategoryController", {
    enumerable: true,
    get: function() {
        return CategoryController;
    }
});
const _common = require("@nestjs/common");
const _categoryservice = require("./category.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
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
let CategoryController = class CategoryController {
    findAll() {
        return this.categoryService.findAll();
    }
    findSubCategories(mainCategory) {
        return this.categoryService.findSubCategories(mainCategory);
    }
    addSubCategory(mainCategory, subCategory) {
        return this.categoryService.addSubCategory(mainCategory, subCategory);
    }
    addMainCategory(mainCategory) {
        return this.categoryService.addMainCategory(mainCategory);
    }
    removeSubCategory(mainCategory, subCategory) {
        return this.categoryService.removeSubCategory(mainCategory, subCategory);
    }
    removeMainCategory(mainCategory) {
        return this.categoryService.removeMainCategory(mainCategory);
    }
    constructor(categoryService){
        this.categoryService = categoryService;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], CategoryController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':mainCategory/subcategories'),
    _ts_param(0, (0, _common.Param)('mainCategory')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CategoryController.prototype, "findSubCategories", null);
_ts_decorate([
    (0, _common.Post)(':mainCategory/subcategory'),
    _ts_param(0, (0, _common.Param)('mainCategory')),
    _ts_param(1, (0, _common.Body)('subCategory')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CategoryController.prototype, "addSubCategory", null);
_ts_decorate([
    (0, _common.Post)('main-category'),
    _ts_param(0, (0, _common.Body)('mainCategory')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CategoryController.prototype, "addMainCategory", null);
_ts_decorate([
    (0, _common.Delete)(':mainCategory/subcategory/:subCategory'),
    _ts_param(0, (0, _common.Param)('mainCategory')),
    _ts_param(1, (0, _common.Param)('subCategory')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CategoryController.prototype, "removeSubCategory", null);
_ts_decorate([
    (0, _common.Delete)(':mainCategory'),
    _ts_param(0, (0, _common.Param)('mainCategory')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], CategoryController.prototype, "removeMainCategory", null);
CategoryController = _ts_decorate([
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _common.Controller)('categories'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _categoryservice.CategoryService === "undefined" ? Object : _categoryservice.CategoryService
    ])
], CategoryController);

//# sourceMappingURL=category.controller.js.map