"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LicensesController", {
    enumerable: true,
    get: function() {
        return LicensesController;
    }
});
const _common = require("@nestjs/common");
const _licensesservice = require("./licenses.service");
const _invitationservice = require("../../common/services/invitation.service");
const _jwtauthguard = require("../../common/guards/jwt-auth.guard");
const _getcurrentuserdecorator = require("../../common/decorators/get-current-user.decorator");
const _assignlicensedto = require("./dto/assign-license.dto");
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
let LicensesController = class LicensesController {
    /**
   * Tenant'ın lisans statusunu getir
   */ async getLicenseStatus(tenantId) {
        return await this.licensesService.getTenantLicenseStatus(tenantId);
    }
    /**
   * Kullanıcıya ana paket lisansı ata
   */ async assignBasePlanLicense(dto, assignedBy) {
        await this.licensesService.assignBasePlanLicense(dto.userId, assignedBy);
        return {
            message: 'Ana paket lisansı başarıyla atandı'
        };
    }
    /**
   * Kullanıcıya modül lisansı ata
   */ async assignModuleLicense(dto, assignedBy) {
        await this.licensesService.assignModuleLicense(dto.userId, dto.moduleSlug, assignedBy);
        return {
            message: 'Modül lisansı başarıyla atandı'
        };
    }
    /**
   * Kullanıcıdan lisansı iptal et
   */ async revokeLicense(licenseId, revokedBy) {
        await this.licensesService.revokeLicense(licenseId, revokedBy);
        return {
            message: 'Lisans başarıyla iptal edildi'
        };
    }
    /**
   * Kullanıcının lisanslarını getir
   */ async getUserLicenses(userId) {
        return await this.licensesService.getUserLicenses(userId);
    }
    /**
   * Tenant'ın tüm lisanslı kullanıcılarını getir
   */ async getTenantLicensedUsers(tenantId) {
        return await this.licensesService.getTenantLicensedUsers(tenantId);
    }
    /**
   * Tenant'ın tüm kullanıcılarını getir (lisanslı ve lisanssız)
   */ async getAllTenantUsers(tenantId) {
        return await this.licensesService.getAllTenantUsers(tenantId);
    }
    /**
   * Kullanıcı davet et
   */ async inviteUser(dto, tenantId, invitedBy) {
        return await this.invitationService.inviteUser(dto.email, tenantId, invitedBy);
    }
    /**
   * Tenant'ın davetlerini listele
   */ async getInvitations(tenantId) {
        return await this.invitationService.getTenantInvitations(tenantId);
    }
    /**
   * Ek kullanıcı satın al
   */ async purchaseAdditionalUsers(dto, tenantId) {
        const quantity = parseInt(dto.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            throw new Error('Geçersiz quantity');
        }
        return await this.licensesService.purchaseAdditionalUsers(tenantId, quantity);
    }
    /**
   * Modül lisansı satın al
   */ async purchaseModuleLicense(dto, tenantId) {
        const quantity = parseInt(dto.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            throw new Error('Geçersiz quantity');
        }
        return await this.licensesService.purchaseModuleLicense(tenantId, dto.moduleSlug, quantity);
    }
    constructor(licensesService, invitationService){
        this.licensesService = licensesService;
        this.invitationService = invitationService;
    }
};
_ts_decorate([
    (0, _common.Get)('status'),
    _ts_param(0, (0, _getcurrentuserdecorator.GetCurrentUser)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LicensesController.prototype, "getLicenseStatus", null);
_ts_decorate([
    (0, _common.Post)('assign/base-plan'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _assignlicensedto.AssignBasePlanLicenseDto === "undefined" ? Object : _assignlicensedto.AssignBasePlanLicenseDto,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LicensesController.prototype, "assignBasePlanLicense", null);
_ts_decorate([
    (0, _common.Post)('assign/module'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _assignlicensedto.AssignModuleLicenseDto === "undefined" ? Object : _assignlicensedto.AssignModuleLicenseDto,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LicensesController.prototype, "assignModuleLicense", null);
_ts_decorate([
    (0, _common.Delete)('revoke/:licenseId'),
    _ts_param(0, (0, _common.Param)('licenseId')),
    _ts_param(1, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LicensesController.prototype, "revokeLicense", null);
_ts_decorate([
    (0, _common.Get)('user/:userId'),
    _ts_param(0, (0, _common.Param)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LicensesController.prototype, "getUserLicenses", null);
_ts_decorate([
    (0, _common.Get)('users'),
    _ts_param(0, (0, _getcurrentuserdecorator.GetCurrentUser)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LicensesController.prototype, "getTenantLicensedUsers", null);
_ts_decorate([
    (0, _common.Get)('users/all'),
    _ts_param(0, (0, _getcurrentuserdecorator.GetCurrentUser)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LicensesController.prototype, "getAllTenantUsers", null);
_ts_decorate([
    (0, _common.Post)('invite'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _getcurrentuserdecorator.GetCurrentUser)('tenantId')),
    _ts_param(2, (0, _getcurrentuserdecorator.GetCurrentUser)('userId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _assignlicensedto.InviteUserDto === "undefined" ? Object : _assignlicensedto.InviteUserDto,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LicensesController.prototype, "inviteUser", null);
_ts_decorate([
    (0, _common.Get)('invitations'),
    _ts_param(0, (0, _getcurrentuserdecorator.GetCurrentUser)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LicensesController.prototype, "getInvitations", null);
_ts_decorate([
    (0, _common.Post)('purchase/additional-users'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _getcurrentuserdecorator.GetCurrentUser)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _assignlicensedto.PurchaseAdditionalUsersDto === "undefined" ? Object : _assignlicensedto.PurchaseAdditionalUsersDto,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LicensesController.prototype, "purchaseAdditionalUsers", null);
_ts_decorate([
    (0, _common.Post)('purchase/module'),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _getcurrentuserdecorator.GetCurrentUser)('tenantId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _assignlicensedto.PurchaseModuleLicenseDto === "undefined" ? Object : _assignlicensedto.PurchaseModuleLicenseDto,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LicensesController.prototype, "purchaseModuleLicense", null);
LicensesController = _ts_decorate([
    (0, _common.Controller)('licenses'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _licensesservice.LicensesService === "undefined" ? Object : _licensesservice.LicensesService,
        typeof _invitationservice.InvitationService === "undefined" ? Object : _invitationservice.InvitationService
    ])
], LicensesController);

//# sourceMappingURL=licenses.controller.js.map