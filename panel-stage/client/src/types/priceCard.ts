export enum PriceType {
    SALE = 'SALE',
    PURCHASE = 'PURCHASE',
    CAMPAIGN = 'CAMPAIGN',
    LIST = 'LIST',
}

export enum PriceCardStatus {
    ACTIVE = 'ACTIVE',
    PASSIVE = 'PASSIVE',
    EXPIRED = 'EXPIRED',
}

export enum PriceSource {
    MANUAL = 'MANUAL',
    IMPORT = 'IMPORT',
    FORMULA = 'FORMULA',
    API = 'API',
}

export interface IPriceCard {
    id: string;
    tenantId: string;
    productId: string;

    salePrice: number | string;
    purchasePrice?: number | string | null;
    vatRate: number | string;
    currency: string;

    effectiveFrom: string | Date;
    effectiveTo?: string | Date | null;

    customerId?: string | null;
    customerGroupId?: string | null;
    priceListId?: string | null;

    minQuantity: number | string;

    priceType: PriceType;
    status: PriceCardStatus;
    source: PriceSource;

    createdBy: string;
    createdAt: string | Date;
    updatedBy?: string | null;
    updatedAt: string | Date;
    notes?: string | null;

    // Relations (optional based on include)
    product?: {
        id: string;
        code: string;
        name: string;
        unit?: string;
        brand?: string;
    };
}

export interface ICreatePriceCardRequest {
    productId: string;
    salePrice: number;
    purchasePrice?: number | null;
    vatRate?: number;
    currency?: string;

    effectiveFrom: string; // ISO DateTime
    effectiveTo?: string | null; // ISO DateTime

    customerId?: string | null;
    customerGroupId?: string | null;
    priceListId?: string | null;

    minQuantity?: number;

    priceType: PriceType;
    status: PriceCardStatus;
    source?: PriceSource;

    notes?: string | null;
}

export interface IUpdatePriceCardRequest extends Partial<ICreatePriceCardRequest> { }

export interface IPriceCardFilterParams {
    productId?: string;
    priceType?: PriceType;
    status?: PriceCardStatus;
    customerId?: string;
    q?: string; // Genel arama
    page?: number;
    limit?: number;
}

export interface IPaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
