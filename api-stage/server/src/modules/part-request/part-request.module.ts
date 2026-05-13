import { Module } from '@nestjs/common';
import { PartRequestService } from './part-request.service';
import { PartRequestController } from './part-request.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { SystemParameterModule } from '../system-parameter/system-parameter.module';

@Module({
  imports: [PrismaModule, TenantContextModule, SystemParameterModule],
  controllers: [PartRequestController],
  providers: [PartRequestService],
  exports: [PartRequestService],
})
export class PartRequestModule {}
