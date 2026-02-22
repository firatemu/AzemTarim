import { Module } from '@nestjs/common';
import { WorkOrderItemService } from './work-order-item.service';
import { WorkOrderItemController } from './work-order-item.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [WorkOrderItemController],
  providers: [WorkOrderItemService],
  exports: [WorkOrderItemService],
})
export class WorkOrderItemModule {}
