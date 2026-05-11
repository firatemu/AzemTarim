import { Injectable } from '@nestjs/common';
import { B2BErpAdapter } from '@prisma/client';
import { ErpProductLiveMetricsService } from '../../../common/services/erp-product-live-metrics.service';
import { PrismaService } from '../../../common/prisma.service';
import { LogoErpAdapter } from './logo-erp.adapter';
import { MikroErpAdapter } from './mikro-erp.adapter';
import { OtomuhasebeErpAdapter } from './otomuhasebe-erp.adapter';
import type { IErpAdapter } from './i-erp-adapter.interface';

@Injectable()
export class B2BAdapterFactory {
  constructor(
    private readonly prisma: PrismaService,
    private readonly liveMetrics: ErpProductLiveMetricsService,
  ) { }

  create(adapterType: B2BErpAdapter, tenantId: string): IErpAdapter {
    switch (adapterType) {
      case B2BErpAdapter.OTOMUHASEBE:
        return new OtomuhasebeErpAdapter(this.prisma, tenantId, this.liveMetrics);
      case B2BErpAdapter.LOGO:
        return new LogoErpAdapter(this.prisma, tenantId);
      case B2BErpAdapter.MIKRO:
        return new MikroErpAdapter();
      default: {
        const _exhaustive: never = adapterType;
        return _exhaustive;
      }
    }
  }
}
