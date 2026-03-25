import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { B2BOrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class B2bOrderListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: B2BOrderStatus })
  @IsOptional()
  @IsEnum(B2BOrderStatus)
  status?: B2BOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salespersonId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class PatchB2bOrderStatusDto {
  @ApiProperty({ enum: B2BOrderStatus })
  @IsEnum(B2BOrderStatus)
  status!: B2BOrderStatus;
}

export class RejectB2bOrderDto {
  @ApiProperty()
  @IsString()
  reason!: string;
}
