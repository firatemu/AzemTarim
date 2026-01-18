import { Module } from '@nestjs/common';
import { WorkOrderController } from './work-order.controller';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  controllers: [WorkOrderController],
  providers: [WorkOrderService, PrismaService, TenantContextService],
  exports: [WorkOrderService],
})
export class WorkOrderModule {}

