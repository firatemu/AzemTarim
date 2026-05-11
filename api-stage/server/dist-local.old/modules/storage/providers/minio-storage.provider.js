"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MinIOStorageProvider", {
    enumerable: true,
    get: function() {
        return MinIOStorageProvider;
    }
});
const _common = require("@nestjs/common");
const _minio = /*#__PURE__*/ _interop_require_wildcard(require("minio"));
const _tenantcontextservice = require("../../../common/services/tenant-context.service");
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
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let MinIOStorageProvider = class MinIOStorageProvider {
    async onModuleInit() {
        try {
            // Ensure bucket exists
            const exists = await this.client.bucketExists(this.bucketName);
            if (!exists) {
                await this.client.makeBucket(this.bucketName);
                this.logger.log(`✅ Bucket '${this.bucketName}' created`);
            }
            // Enable versioning
            await this.client.setBucketVersioning(this.bucketName, {
                Status: 'Enabled'
            });
            this.logger.log(`✅ Versioning enabled for '${this.bucketName}'`);
        } catch (error) {
            // Don't crash the app in development or staging if MinIO is not available
            if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging') {
                this.logger.warn(`⚠️  MinIO initialization failed in ${process.env.NODE_ENV} mode: ${error.message}`);
                this.logger.warn('⚠️  Storage operations will fail until MinIO is available');
            } else {
                this.logger.error(`❌ MinIO initialization failed: ${error.message}`);
                throw error;
            }
        }
    }
    async uploadFile(params) {
        let { tenantId } = params;
        const { file, folder } = params;
        // Auto-resolve tenant if not passed (Strict Isolation)
        if (!tenantId) {
            tenantId = this.tenantContext.getTenantId();
        }
        // Fail-Fast: Security Guard
        if (!tenantId) {
            this.logger.error('Security Alert: Attempted file upload without Tenant Context.');
            throw new _common.BadRequestException('Tenant context missing for storage operation.');
        }
        const objectKey = `${tenantId}/${folder}/${Date.now()}_${file.originalname}`;
        await this.client.putObject(this.bucketName, objectKey, file.buffer, file.size, {
            'Content-Type': file.mimetype,
            'X-Tenant-Id': tenantId
        });
        this.logger.log(`✅ Uploaded file: ${objectKey}`);
        return objectKey;
    }
    async getFile(params) {
        // Generate presigned URL (valid for 1 hour)
        const url = await this.client.presignedGetObject(this.bucketName, params.key, 3600);
        return {
            url,
            type: 'presigned'
        };
    }
    async deleteFile(params) {
        // Soft delete - creates a delete marker
        await this.client.removeObject(this.bucketName, params.key);
        this.logger.log(`🗑️ Soft deleted file: ${params.key}`);
    }
    async hardDeleteAllVersions(params) {
        const versions = await this.listObjectVersions(params.key);
        for (const version of versions){
            await this.client.removeObject(this.bucketName, params.key, {
                versionId: version.versionId
            });
        }
        this.logger.log(`💀 Hard deleted all versions of file: ${params.key} (${versions.length} versions)`);
    }
    async purgeTenantData(tenantId) {
        const prefix = `${tenantId}/`;
        const objectsStream = this.client.listObjectsV2(this.bucketName, prefix, true);
        const objects = [];
        for await (const obj of objectsStream){
            objects.push(obj.name);
        }
        let deletedCount = 0;
        const errors = [];
        for (const objectKey of objects){
            try {
                // Hard delete all versions
                await this.hardDeleteAllVersions({
                    tenantId,
                    key: objectKey
                });
                deletedCount++;
            } catch (error) {
                errors.push(`Failed to delete ${objectKey}: ${error.message}`);
            }
        }
        this.logger.warn(`💥 Purged tenant ${tenantId}: ${deletedCount} files deleted`);
        return {
            deletedCount,
            errors
        };
    }
    async listFiles(params) {
        const prefix = params.folder ? `${params.tenantId}/${params.folder}/` : `${params.tenantId}/`;
        const objectsStream = this.client.listObjectsV2(this.bucketName, prefix, true);
        const files = [];
        for await (const obj of objectsStream){
            files.push(obj.name);
        }
        return files;
    }
    async listObjectVersions(key) {
        const versions = [];
        const stream = this.client.listObjects(this.bucketName, key, false, {
            IncludeVersion: true
        });
        for await (const obj of stream){
            if (obj.versionId) {
                versions.push({
                    versionId: obj.versionId,
                    isLatest: obj.isLatest || false
                });
            }
        }
        return versions;
    }
    constructor(tenantContext){
        this.tenantContext = tenantContext;
        this.logger = new _common.Logger(MinIOStorageProvider.name);
        this.bucketName = process.env.MINIO_BUCKET || 'otomuhasebe';
        const port = parseInt(process.env.MINIO_PORT || '9000');
        const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
        const useSSL = process.env.MINIO_USE_SSL === 'true';
        this.client = new _minio.Client({
            endPoint: endpoint,
            port: port,
            useSSL: useSSL,
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY,
            region: process.env.MINIO_REGION || 'us-east-1',
            pathStyle: true
        });
    }
};
MinIOStorageProvider = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantcontextservice.TenantContextService === "undefined" ? Object : _tenantcontextservice.TenantContextService
    ])
], MinIOStorageProvider);

//# sourceMappingURL=minio-storage.provider.js.map