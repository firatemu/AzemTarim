"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CipherService", {
    enumerable: true,
    get: function() {
        return CipherService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _crypto = require("crypto");
const _util = require("util");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CipherService = class CipherService {
    async encrypt(text) {
        const iv = (0, _crypto.randomBytes)(16);
        const salt = 'salt'; // In production, use a unique salt or derive properly
        const key = await (0, _util.promisify)(_crypto.scrypt)(this.secretKey, salt, 32);
        const cipher = (0, _crypto.createCipheriv)(this.algorithm, key, iv);
        const encrypted = Buffer.concat([
            cipher.update(text, 'utf8'),
            cipher.final()
        ]);
        const tag = cipher.getAuthTag();
        // Format: v1:iv_hex:tag_hex:ciphertext_hex
        return `v1:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
    }
    async decrypt(encryptedText) {
        // Handle legacy JSON format temporarily if needed, or strictly enforce new format.
        // Given "Foundation" phase, we enforce strict new format but handle errors gracefully.
        const parts = encryptedText.split(':');
        // Basic format check
        if (parts.length !== 4 || parts[0] !== 'v1') {
            // Fallback to legacy JSON parsing if valid, else throw
            try {
                const legacy = JSON.parse(encryptedText);
                if (legacy.iv && legacy.content && legacy.tag) {
                    return this.decryptLegacy(legacy);
                }
            } catch (e) {
            // Not JSON, throw error below
            }
            throw new Error('Invalid encryption format or unsupported version');
        }
        const [version, ivHex, tagHex, contentHex] = parts;
        const salt = 'salt';
        const key = await (0, _util.promisify)(_crypto.scrypt)(this.secretKey, salt, 32);
        const decipher = (0, _crypto.createDecipheriv)(this.algorithm, key, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(contentHex, 'hex')),
            decipher.final()
        ]);
        return decrypted.toString('utf8');
    }
    async decryptLegacy(legacy) {
        const key = await (0, _util.promisify)(_crypto.scrypt)(this.secretKey, 'salt', 32);
        const decipher = (0, _crypto.createDecipheriv)(this.algorithm, key, Buffer.from(legacy.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(legacy.tag, 'hex'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(legacy.content, 'hex')),
            decipher.final()
        ]);
        return decrypted.toString('utf8');
    }
    constructor(configService){
        this.configService = configService;
        this.algorithm = 'aes-256-gcm';
        this.secretKey = this.configService.get('ENCRYPTION_KEY') || 'default-secret-key-must-be-32-chars';
    }
};
CipherService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], CipherService);

//# sourceMappingURL=cipher.service.js.map