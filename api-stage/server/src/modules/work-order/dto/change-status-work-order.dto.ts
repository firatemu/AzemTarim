import { IsEnum } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class ChangeStatusWorkOrderDto {
  @IsEnum(WorkOrderStatus)
  status: WorkOrderStatus;
}
