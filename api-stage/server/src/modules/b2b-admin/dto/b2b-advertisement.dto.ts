import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { B2BAdType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateB2bAdvertisementDto {
  @ApiProperty({ enum: B2BAdType })
  @IsEnum(B2BAdType)
  type!: B2BAdType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}

export class UpdateB2bAdvertisementDto {
  @ApiPropertyOptional({ enum: B2BAdType })
  @IsOptional()
  @IsEnum(B2BAdType)
  type?: B2BAdType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

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
