"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TcmbService", {
    enumerable: true,
    get: function() {
        return TcmbService;
    }
});
const _common = require("@nestjs/common");
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
const _xml2js = /*#__PURE__*/ _interop_require_wildcard(require("xml2js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
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
let TcmbService = class TcmbService {
    async getCurrentRate(currencyCode) {
        if (currencyCode === 'TRY') return 1.0;
        const now = Date.now();
        if (this.cache && now - this.cache.timestamp < this.CACHE_TTL) {
            this.logger.debug(`Returning cached rate for ${currencyCode}`);
            return this.cache.rates[currencyCode] || 0;
        }
        try {
            this.logger.log('Fetching exchange rates from TCMB...');
            const response = await _axios.default.get('https://www.tcmb.gov.tr/kurlar/today.xml');
            const parser = new _xml2js.Parser();
            const result = await parser.parseStringPromise(response.data);
            const rates = {};
            if (result.Tarih_Date && result.Tarih_Date.Currency) {
                for (const curr of result.Tarih_Date.Currency){
                    const code = curr.$.CurrencyCode;
                    // TCMB uses ForexBuying for buying rate
                    const rate = parseFloat(curr.ForexBuying[0]);
                    if (code && !isNaN(rate)) {
                        rates[code] = rate;
                    }
                }
            }
            this.cache = {
                timestamp: now,
                rates
            };
            this.logger.log(`Rates updated. Cached ${Object.keys(rates).length} currencies.`);
            return rates[currencyCode] || 0;
        } catch (error) {
            this.logger.error(`Failed to fetch rates: ${error.message}`);
            // Return 0 or maybe throw error? 0 indicates failure to get rate.
            return 0;
        }
    }
    constructor(){
        this.logger = new _common.Logger(TcmbService.name);
        this.cache = null;
        this.CACHE_TTL = 3600 * 1000; // 1 hour
    }
};
TcmbService = _ts_decorate([
    (0, _common.Injectable)()
], TcmbService);

//# sourceMappingURL=tcmb.service.js.map