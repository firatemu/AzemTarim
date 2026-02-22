import { IsEnum } from 'class-validator';
import { VehicleWorkflowStatus } from '@prisma/client';

export class ChangeVehicleWorkflowDto {
  @IsEnum(VehicleWorkflowStatus)
  vehicleWorkflowStatus: VehicleWorkflowStatus;
}
