import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { WorkOrderItemType } from '@prisma/client';

export class CreateWorkOrderItemDto {
  @IsNotEmpty()
  @IsString()
  workOrderId: string;

  @IsNotEmpty()
  @IsEnum(WorkOrderItemType)
  type: WorkOrderItemType;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  stokId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;
}
