import { PrismaModule } from '../../common/prisma.module';
import { Module } from '@nestjs/common';
import { PriceCardService } from './price-card.service';
import { PriceCardController } from './price-card.controller';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [PriceCardController],
  providers: [PriceCardService],
  exports: [PriceCardService],
})
export class PriceCardModule { }
