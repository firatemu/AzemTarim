"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LocalStorageProvider", {
    enumerable: true,
    get: function() {
        return LocalStorageProvider;
    }
});
const _common = require("@nestjs/common");
const _fsextra = /*#__PURE__*/ _interop_require_wildcard(require("fs-extra"));
const _path = /*#__PURE__*/ _interop_require_wildcard(require("path"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let LocalStorageProvider = class LocalStorageProvider {
    async uploadFile(params) {
        const { tenantId, file, folder } = params;
        const dir = _path.join(this.uploadDir, tenantId, folder);
        await _fsextra.ensureDir(dir);
        const filename = `${Date.now()}_${file.originalname}`;
        const filePath = _path.join(dir, filename);
        await _fsextra.writeFile(filePath, file.buffer);
        // Return relative path
        return _path.join(tenantId, folder, filename);
    }
    async getFile(params) {
        const filePath = _path.join(this.uploadDir, params.key);
        if (!await _fsextra.pathExists(filePath)) {
            throw new Error('File not found');
        }
        return {
            url: `/uploads/${params.key}`,
            type: 'direct'
        };
    }
    async deleteFile(params) {
        const filePath = _path.join(this.uploadDir, params.key);
        await _fsextra.remove(filePath);
    }
    async hardDeleteAllVersions(params) {
        // Local storage has no versioning, same as deleteFile
        await this.deleteFile(params);
    }
    async purgeTenantData(tenantId) {
        const tenantDir = _path.join(this.uploadDir, tenantId);
        const files = await this.listFilesRecursive(tenantDir);
        await _fsextra.remove(tenantDir);
        return {
            deletedCount: files.length,
            errors: []
        };
    }
    async listFiles(params) {
        const dir = params.folder ? _path.join(this.uploadDir, params.tenantId, params.folder) : _path.join(this.uploadDir, params.tenantId);
        return this.listFilesRecursive(dir);
    }
    async listFilesRecursive(dir) {
        const files = [];
        if (!await _fsextra.pathExists(dir)) {
            return files;
        }
        const entries = await _fsextra.readdir(dir, {
            withFileTypes: true
        });
        for (const entry of entries){
            const fullPath = _path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...await this.listFilesRecursive(fullPath));
            } else {
                files.push(fullPath);
            }
        }
        return files;
    }
    constructor(){
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    }
};
LocalStorageProvider = _ts_decorate([
    (0, _common.Injectable)()
], LocalStorageProvider);

//# sourceMappingURL=local-storage.provider.js.map