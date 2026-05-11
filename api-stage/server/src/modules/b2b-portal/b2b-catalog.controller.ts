import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { B2BWarehouseDisplayMode, Prisma } from '@prisma/client';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { ErpProductLiveMetricsService } from '../../common/services/erp-product-live-metrics.service';
import { PrismaService } from '../../common/prisma.service';
import { B2bDomainGuard } from './guards/b2b-domain.guard';
import { B2bJwtAuthGuard } from './guards/b2b-jwt-auth.guard';
import { B2bClaimsMatchGuard } from './guards/b2b-claims-match.guard';
import { B2bEffectiveCustomerGuard } from './guards/b2b-effective-customer.guard';
import { B2bPaginationQueryDto } from './dto/b2b-pagination.dto';
import { B2bPriceService } from './services/b2b-price.service';
import { B2bTenantSchemaBridgeService } from './services/b2b-tenant-schema-bridge.service';
import type { B2bJwtPayload } from './types/b2b-jwt-payload';
import type { Request } from 'express';

@ApiTags('B2B Portal')
@Controller('b2b/catalog')
@UseGuards(
  B2bDomainGuard,
  B2BLicenseGuard,
  B2bJwtAuthGuard,
  B2bClaimsMatchGuard,
)
@ApiBearerAuth()
export class B2bCatalogController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly price: B2bPriceService,
    private readonly schemaBridge: B2bTenantSchemaBridgeService,
    private readonly liveMetrics: ErpProductLiveMetricsService,
  ) { }

  private parsePricingAt(iso?: string): Date {
    if (!iso?.trim()) {
      return new Date();
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException('pricingAt gecersiz ISO tarih');
    }
    return d;
  }

  @Get('products')
  @UseGuards(B2bEffectiveCustomerGuard)
  @ApiOperation({
    summary: 'B2B katalog ürün listesi',
    description:
      'Satır fiyatı: erpListPrice − müşteri sınıfı iskontosu; kampanya oranı bu tutar üzerinden uygulanır. ' +
      'Aktif kampanyalar `pricingAt` (query, ISO 8601) veya anlık zaman ile B2BDiscount aralığına göre seçilir.',
  })
  async listProducts(@Req() req: Request, @Query() q: B2bPaginationQueryDto) {
    const user = req.user as B2bJwtPayload;
    const customerId = req.effectiveB2bCustomerId as string;
    const tenantId = user.tenantId;
    const schemaName = await this.schemaBridge.getDeclaredSchemaName(tenantId);
    this.schemaBridge.logSchemaHint(tenantId, schemaName);

    const pricingRef = this.parsePricingAt(q.pricingAt);

    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 20;
    const search = (q.search ?? '').trim();
    const brand = (q.brand ?? '').trim();
    const category = (q.category ?? '').trim();

    const whConfigs = await this.prisma.b2BWarehouseConfig.findMany({
      where: { tenantId, isActive: true },
    });
    const collapseWarehouses =
      whConfigs.length > 0 &&
      whConfigs.every(
        (c) => c.displayMode === B2BWarehouseDisplayMode.COMBINED,
      );

    const where: Prisma.B2BProductWhereInput = {
      tenantId,
      isVisibleInB2B: true,
      ...(brand ? { brand } : {}),
      ...(category ? { category } : {}),
      ...(search
        ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { stockCode: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { oemCode: { contains: search, mode: 'insensitive' } },
            { supplierCode: { contains: search, mode: 'insensitive' } },
          ],
        }
        : {}),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.b2BProduct.count({ where }),
      this.prisma.b2BProduct.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          erpProductId: true,
          stockCode: true,
          name: true,
          description: true,
          brand: true,
          category: true,
          unit: true,
          erpListPrice: true,
          minOrderQuantity: true,
          imageUrl: true,
          oemCode: true,
          supplierCode: true,
          product: {
            select: { code: true, name: true },
          },
        },
      }),
    ]);

    const erpIds = rows.map((r) => r.erpProductId);
    const [qtyMap, priceMap, defaultWh] = await Promise.all([
      this.liveMetrics.computeNetQuantitiesFromMovements(tenantId, erpIds),
      this.liveMetrics.getListUnitPricesByProductIds(tenantId, erpIds),
      this.liveMetrics.getDefaultWarehouse(tenantId),
    ]);

    const data = await Promise.all(
      rows.map(async (p) => {
        const { product: erpRow, ...pRest } = p;
        const erpId = p.erpProductId;
        const netQty = qtyMap.get(erpId) ?? 0;
        const liveList = priceMap.get(erpId) ?? Number(p.erpListPrice);
        const stocks = this.liveMetrics.buildLiveStockSnapshot(netQty, defaultWh);
        const stocksDto = stocks.map((s) => ({
          warehouseId: s.warehouseId,
          warehouseName: s.warehouseName,
          isAvailable: s.isAvailable,
          quantity: s.quantity,
        }));
        const inStock = netQty > 0;
        const warehouses = collapseWarehouses ? [] : stocksDto;
        const pricing = await this.price.getUnitPriceBreakdown(
          tenantId,
          customerId,
          p.id,
          pricingRef,
        );
        return {
          ...pRest,
          stockCode: erpRow?.code ?? p.stockCode,
          name: erpRow?.name ?? p.name,
          erpListPrice: liveList,
          pricing: {
            listUnit: pricing.listUnit,
            customerClassDiscountUnit: pricing.customerClassDiscountUnit,
            campaignDiscountUnit: pricing.campaignDiscountUnit,
            finalUnit: pricing.finalUnit,
          },
          stockPresentation: collapseWarehouses
            ? 'COMBINED'
            : ('INDIVIDUAL' as const),
          inStock,
          warehouses,
        };
      }),
    );

    return {
      data,
      meta: { total, page, pageSize, pageCount: Math.ceil(total / pageSize) },
    };
  }

  @Get('products/:productId')
  @UseGuards(B2bEffectiveCustomerGuard)
  @ApiOperation({
    summary: 'Ürün detay ve müşteri fiyat kırılımı',
    description:
      'Bileşik iskonto: sınıf sonrası birim üzerinden kampanya. `pricingAt` ile kampanya penceresi simüle edilir.',
  })
  @ApiQuery({
    name: 'pricingAt',
    required: false,
    description: 'Kampanya aktiflik referansı (ISO 8601), varsayılan şimdi',
  })
  async productDetail(
    @Req() req: Request,
    @Param('productId') productId: string,
    @Query('pricingAt') pricingAt?: string,
  ) {
    const user = req.user as B2bJwtPayload;
    const customerId = req.effectiveB2bCustomerId as string;
    const tenantId = user.tenantId;
    const pricingRef = this.parsePricingAt(pricingAt);

    const whConfigs = await this.prisma.b2BWarehouseConfig.findMany({
      where: { tenantId, isActive: true },
    });
    const collapseWarehouses =
      whConfigs.length > 0 &&
      whConfigs.every(
        (c) => c.displayMode === B2BWarehouseDisplayMode.COMBINED,
      );

    const product = await this.prisma.b2BProduct.findFirst({
      where: { id: productId, tenantId, isVisibleInB2B: true },
      include: {
        product: {
          select: { code: true, name: true },
        },
      },
    });
    if (!product) {
      throw new NotFoundException('Urun bulunamadi');
    }
    const [qtyMap, priceMap, defaultWh] = await Promise.all([
      this.liveMetrics.computeNetQuantitiesFromMovements(tenantId, [
        product.erpProductId,
      ]),
      this.liveMetrics.getListUnitPricesByProductIds(tenantId, [
        product.erpProductId,
      ]),
      this.liveMetrics.getDefaultWarehouse(tenantId),
    ]);
    const netQty = qtyMap.get(product.erpProductId) ?? 0;
    const liveList =
      priceMap.get(product.erpProductId) ?? Number(product.erpListPrice);
    const stocks = this.liveMetrics.buildLiveStockSnapshot(netQty, defaultWh);
    const stocksDto = stocks.map((s) => ({
      warehouseId: s.warehouseId,
      warehouseName: s.warehouseName,
      isAvailable: s.isAvailable,
      quantity: s.quantity,
    }));
    const pricing = await this.price.getUnitPriceBreakdown(
      tenantId,
      customerId,
      productId,
      pricingRef,
    );
    const presentation = collapseWarehouses ? 'COMBINED' : 'INDIVIDUAL';
    const warehouses = collapseWarehouses ? [] : stocksDto;
    const { product: erp, ...rest } = product;
    return {
      product: {
        ...rest,
        stockCode: erp?.code ?? product.stockCode,
        name: erp?.name ?? product.name,
        erpListPrice: liveList,
        stocks: collapseWarehouses ? [] : stocksDto,
      },
      pricing,
      stockPresentation: presentation,
      inStock: netQty > 0,
      warehouses,
    };
  }

  @Get('brands')
  @ApiOperation({ summary: 'Filtre icin marka listesi' })
  async brands(@Req() req: Request) {
    const user = req.user as B2bJwtPayload;
    const rows = await this.prisma.b2BProduct.findMany({
      where: {
        tenantId: user.tenantId,
        isVisibleInB2B: true,
        brand: { not: null },
      },
      distinct: ['brand'],
      select: { brand: true },
      orderBy: { brand: 'asc' },
    });
    return {
      data: rows
        .map((r) => r.brand)
        .filter((b): b is string => !!b && b.length > 0),
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Filtre icin kategori listesi' })
  async categories(@Req() req: Request) {
    const user = req.user as B2bJwtPayload;
    const rows = await this.prisma.b2BProduct.findMany({
      where: {
        tenantId: user.tenantId,
        isVisibleInB2B: true,
        category: { not: null },
      },
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
    return {
      data: rows
        .map((r) => r.category)
        .filter((c): c is string => !!c && c.length > 0),
    };
  }

  @Get('delivery-methods')
  @ApiOperation({ summary: 'Aktif teslimat yöntemleri' })
  async deliveryMethods(@Req() req: Request) {
    const user = req.user as B2bJwtPayload;
    return this.prisma.b2BDeliveryMethod.findMany({
      where: { tenantId: user.tenantId, isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, displayOrder: true },
    });
  }
}
