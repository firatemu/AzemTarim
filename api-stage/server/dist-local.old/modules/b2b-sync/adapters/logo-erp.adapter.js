"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LogoErpAdapter", {
    enumerable: true,
    get: function() {
        return LogoErpAdapter;
    }
});
const _common = require("@nestjs/common");
const _mssql = /*#__PURE__*/ _interop_require_wildcard(require("mssql"));
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
let LogoErpAdapter = class LogoErpAdapter {
    async getConfig() {
        const config = await this.prisma.b2BTenantConfig.findUnique({
            where: {
                tenantId: this.tenantId
            }
        });
        if (!config?.erpConnectionString) {
            throw new Error('Logo ERP ayarları bulunamadı.');
        }
        return JSON.parse(config.erpConnectionString);
    }
    getCompanyStr(companyNo) {
        return String(companyNo).padStart(3, '0');
    }
    getPeriodStr(periodNo) {
        return String(periodNo).padStart(2, '0');
    }
    async getSqlConfig(config) {
        return {
            user: config.user,
            password: config.password,
            server: config.server,
            port: config.port || 1433,
            database: config.database,
            options: {
                encrypt: false,
                trustServerCertificate: true
            },
            connectionTimeout: 10000,
            requestTimeout: 10000
        };
    }
    async testConnection(config) {
        if (!config || !config.server || !config.database || !config.user) {
            return {
                success: false,
                message: 'Eksik bağlantı bilgileri',
                details: 'Sunucu, veritabanı ve kullanıcı bilgileri gereklidir.'
            };
        }
        try {
            const sqlConfig = await this.getSqlConfig(config);
            this.logger.log(`Testing Logo connection to ${config.server}:${config.port || 1433}/${config.database}`);
            const pool = await _mssql.connect(sqlConfig);
            await pool.request().query('SELECT 1 as test');
            await pool.close();
            return {
                success: true,
                message: 'Logo (MSSQL) bağlantısı başarılı.',
                details: 'SQL Server üzerinden veritabanına erişim sağlandı.'
            };
        } catch (error) {
            this.logger.error(`Logo connection test failed: ${error}`);
            return {
                success: false,
                message: 'Bağlantı başarısız',
                details: error instanceof Error ? error.message : 'Bilinmeyen SQL hatası'
            };
        }
    }
    async getProducts(lastSyncedAt) {
        const config = await this.getConfig();
        if (!config.companyNo) {
            throw new Error('Firma Numarası (companyNo) ayarlanmamış. Lütfen ayarlar sayfasından Firma Numarası girin.');
        }
        const tableName = `LG_${this.getCompanyStr(config.companyNo)}_ITEMS`;
        this.logger.log(`Fetching products from ${tableName}`);
        const sqlConfig = await this.getSqlConfig(config);
        const pool = await _mssql.connect(sqlConfig);
        try {
            const result = await pool.request().query(`
        SELECT TOP 10 LOGICALREF, CODE, NAME 
        FROM ${tableName}
        WHERE CARDTYPE = 1
      `);
            return result.recordset.map((row)=>({
                    erpProductId: String(row.LOGICALREF || row.CODE),
                    stockCode: row.CODE,
                    name: row.NAME || 'Bilinmeyen Ürün',
                    listPrice: 0
                }));
        } catch (error) {
            this.logger.error(`Failed to fetch products from ${tableName}:`, error);
            throw new Error(`Ürünler ERP'den alınamadı: ${error instanceof Error ? error.message : String(error)}`);
        } finally{
            await pool.close();
        }
    }
    getStock(_productIds) {
        throw new _common.NotImplementedException('Logo ERP adapter is not implemented yet');
    }
    getStockAll() {
        return Promise.resolve([]);
    }
    getAccount() {
        throw new _common.NotImplementedException('Logo ERP adapter is not implemented yet');
    }
    async getAccounts(lastSyncedAt) {
        const config = await this.getConfig();
        if (!config.companyNo) {
            throw new Error('Firma Numarası (companyNo) ayarlanmamış. Lütfen ayarlar sayfasından Firma Numarası girin.');
        }
        const tableName = `LG_${this.getCompanyStr(config.companyNo)}_CLCARD`;
        this.logger.log(`Fetching accounts from ${tableName}`);
        const sqlConfig = await this.getSqlConfig(config);
        const pool = await _mssql.connect(sqlConfig);
        try {
            // CARDTYPE <> 4 usually excludes 4=Grup Şirketi, but let's just fetch all or where it's a Customer (Alıcı/Satıcı: 1, 2, 3)
            // Logo'da 1: Alıcı, 2: Satıcı, 3: Alıcı+Satıcı, 4: Grup Şirketi
            const result = await pool.request().query(`
        SELECT LOGICALREF, CODE, DEFINITION_ 
        FROM ${tableName}
        WHERE CARDTYPE IN (1, 2, 3)
      `);
            return result.recordset.map((row)=>({
                    erpNum: String(row.LOGICALREF),
                    erpAccountId: String(row.CODE),
                    name: row.DEFINITION_ || 'Bilinmeyen Cari',
                    addresses: []
                }));
        } catch (error) {
            this.logger.error(`Failed to fetch accounts from ${tableName}:`, error);
            throw new Error(`Cariler ERP'den alınamadı: ${error instanceof Error ? error.message : String(error)}`);
        } finally{
            await pool.close();
        }
    }
    getPrices(_lastSyncedAt) {
        throw new _common.NotImplementedException('Logo ERP adapter is not implemented yet');
    }
    getSalespersons() {
        throw new _common.NotImplementedException('Logo ERP adapter is not implemented yet');
    }
    getAccountMovements(_erpAccountId, _lastSyncedAt) {
        throw new _common.NotImplementedException('Logo ERP adapter is not implemented yet');
    }
    getWarehouses() {
        throw new _common.NotImplementedException('Logo ERP adapter is not implemented yet');
    }
    pushOrder(_order) {
        throw new _common.NotImplementedException('Logo ERP adapter is not implemented yet');
    }
    getAccountRisk(_erpAccountId) {
        throw new _common.NotImplementedException('Logo ERP adapter is not implemented yet');
    }
    constructor(prisma, tenantId){
        this.prisma = prisma;
        this.tenantId = tenantId;
        this.logger = new _common.Logger(LogoErpAdapter.name);
    }
};

//# sourceMappingURL=logo-erp.adapter.js.map