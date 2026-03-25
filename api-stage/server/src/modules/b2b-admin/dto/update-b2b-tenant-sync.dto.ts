import { ApiPropertyOptional } from '@nestjs/swagger';
import { B2BOrderApprovalMode, B2BErpAdapter } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdateB2bTenantSyncDto {
  @ApiPropertyOptional({ minimum: 5, maximum: 10080 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(10080)
  syncIntervalMinutes?: number;

  @ApiPropertyOptional({ enum: B2BOrderApprovalMode })
  @IsOptional()
  @IsEnum(B2BOrderApprovalMode)
  orderApprovalMode?: B2BOrderApprovalMode;

  @ApiPropertyOptional({ enum: B2BErpAdapter })
  @IsOptional()
  @IsEnum(B2BErpAdapter)
  erpAdapterType?: B2BErpAdapter;
}
