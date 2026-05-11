"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MikroErpAdapter", {
    enumerable: true,
    get: function() {
        return MikroErpAdapter;
    }
});
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let MikroErpAdapter = class MikroErpAdapter {
    async testConnection(_config) {
        try {
            // TODO: Implement actual Mikro connection test using firebird package
            // For now, return a placeholder response
            // The actual implementation would:
            // 1. Parse connection string (Firebird DB path, username, password)
            // 2. Connect to Mikro Firebird database
            // 3. Run a simple query like SELECT FIRST 1 * FROM ITEMS
            // 4. Return success/failure with 5 second timeout
            this.logger.warn('Mikro ERP connection test not fully implemented');
            return {
                success: false,
                message: 'Mikro ERP bağlantısı yapılandırılamadı.',
                details: 'Firebird sürücüsü ve bağlantı dizesi gereklidir.'
            };
        } catch (error) {
            this.logger.error(`Mikro connection test failed: ${error}`);
            return {
                success: false,
                message: 'Bağlantı başarısız',
                details: error instanceof Error ? error.message : 'Bilinmeyen hata'
            };
        }
    }
    getProducts() {
        throw new _common.NotImplementedException('Mikro ERP adapter is not implemented yet');
    }
    getStock(_productIds) {
        throw new _common.NotImplementedException('Mikro ERP adapter is not implemented yet');
    }
    getStockAll() {
        return Promise.resolve([]);
    }
    getAccount() {
        throw new _common.NotImplementedException('Mikro ERP adapter is not implemented yet');
    }
    getAccounts(lastSyncedAt) {
        throw new _common.NotImplementedException('Mikro ERP adapter is not implemented yet');
    }
    getPrices(_lastSyncedAt) {
        throw new _common.NotImplementedException('Mikro ERP adapter is not implemented yet');
    }
    getSalespersons() {
        throw new _common.NotImplementedException('Mikro ERP adapter is not implemented yet');
    }
    getAccountMovements(_erpAccountId, _lastSyncedAt) {
        throw new _common.NotImplementedException('Mikro ERP adapter is not implemented yet');
    }
    getWarehouses() {
        throw new _common.NotImplementedException('Mikro ERP adapter is not implemented yet');
    }
    pushOrder(_order) {
        throw new _common.NotImplementedException('Mikro ERP adapter is not implemented yet');
    }
    getAccountRisk(_erpAccountId) {
        throw new _common.NotImplementedException('Mikro ERP adapter is not implemented yet');
    }
    constructor(){
        this.logger = new _common.Logger(MikroErpAdapter.name);
    }
};
MikroErpAdapter = _ts_decorate([
    (0, _common.Injectable)()
], MikroErpAdapter);

//# sourceMappingURL=mikro-erp.adapter.js.map