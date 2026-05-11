/**
 * Staging ortamı yardımcı fonksiyonları
 * Staging ortamında tenant ID gereksinimini kaldırmak için kullanılır
 */ /**
 * Staging ortamında mıyız?
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get buildTenantWhereClause () {
        return buildTenantWhereClause;
    },
    get getTenantIdForQuery () {
        return getTenantIdForQuery;
    },
    get isStagingEnvironment () {
        return isStagingEnvironment;
    }
});
function isStagingEnvironment() {
    const isStaging = process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'development' || process.env.APP_ENV === 'staging' || process.env.STAGING_DISABLE_TENANT === 'true' || !!process.env.STAGING_DEFAULT_TENANT_ID;
    if (!isStaging) {
        console.log('[isStagingEnvironment] Returning FALSE. Env:', {
            NODE_ENV: process.env.NODE_ENV,
            APP_ENV: process.env.APP_ENV,
            STAGING_DISABLE: process.env.STAGING_DISABLE_TENANT
        });
    }
    return isStaging;
}
function getTenantIdForQuery(tenantId) {
    if (isStagingEnvironment()) {
        // Staging'de tenantId opsiyonel - undefined dönebilir
        return tenantId;
    }
    // Production'da tenantId zorunlu
    return tenantId;
}
function buildTenantWhereClause(tenantId, includeNull = false) {
    if (isStagingEnvironment()) {
        // Staging'de tenantId opsiyonel
        if (tenantId) {
            if (includeNull) {
                return {
                    OR: [
                        {
                            tenantId
                        },
                        {
                            tenantId: null
                        }
                    ]
                };
            }
            return {
                tenantId
            };
        }
        // TenantId yoksa boş obje döndür (tüm kayıtları getir)
        return {};
    }
    // Production'da tenantId zorunlu
    if (!tenantId) {
        throw new Error('Tenant ID is required in production environment');
    }
    return {
        tenantId
    };
}

//# sourceMappingURL=staging.util.js.map