"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StorageModule", {
    enumerable: true,
    get: function() {
        return StorageModule;
    }
});
const _common = require("@nestjs/common");
const _localstorageprovider = require("./providers/local-storage.provider");
const _miniostorageprovider = require("./providers/minio-storage.provider");
const _tenantcontextmodule = require("../../common/services/tenant-context.module");
const _tenantcontextservice = require("../../common/services/tenant-context.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const storageProvider = {
    provide: 'STORAGE_SERVICE',
    useFactory: (tenantContext)=>{
        const driver = process.env.STORAGE_DRIVER || 'local';
        if (driver === 'minio') {
            return new _miniostorageprovider.MinIOStorageProvider(tenantContext);
        }
        return new _localstorageprovider.LocalStorageProvider();
    },
    inject: [
        _tenantcontextservice.TenantContextService
    ]
};
let StorageModule = class StorageModule {
};
StorageModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _tenantcontextmodule.TenantContextModule
        ],
        providers: [
            storageProvider,
            _localstorageprovider.LocalStorageProvider,
            _miniostorageprovider.MinIOStorageProvider
        ],
        exports: [
            'STORAGE_SERVICE'
        ]
    })
], StorageModule);

//# sourceMappingURL=storage.module.js.map