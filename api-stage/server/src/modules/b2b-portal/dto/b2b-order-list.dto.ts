import { ApiPropertyOptional } from '@nestjs/swagger';
import { B2BOrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class B2bOrderListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 25;

  @ApiPropertyOptional({ enum: B2BOrderStatus })
  @IsOptional()
  @IsEnum(B2BOrderStatus)
  status?: B2BOrderStatus;
}
