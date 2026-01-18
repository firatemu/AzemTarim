import { Module, forwardRef } from '@nestjs/common';
import { FaturaService } from './fatura.service';
import { FaturaController } from './fatura.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { HizliModule } from '../hizli/hizli.module';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { SatisIrsaliyesiModule } from '../satis-irsaliyesi/satis-irsaliyesi.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    HizliModule,
    CodeTemplateModule,
    forwardRef(() => SatisIrsaliyesiModule),
  ],
  controllers: [FaturaController],
  providers: [FaturaService],
  exports: [FaturaService],
})
export class FaturaModule {}
