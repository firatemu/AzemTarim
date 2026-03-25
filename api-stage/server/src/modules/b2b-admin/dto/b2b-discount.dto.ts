import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { B2BDiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateB2bDiscountDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: B2BDiscountType })
  @IsEnum(B2BDiscountType)
  type!: B2BDiscountType;

  @ApiProperty({ description: 'classId | brand | category | comma-separated product ids' })
  @IsString()
  targetValue!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class UpdateB2bDiscountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: B2BDiscountType })
  @IsOptional()
  @IsEnum(B2BDiscountType)
  type?: B2BDiscountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
