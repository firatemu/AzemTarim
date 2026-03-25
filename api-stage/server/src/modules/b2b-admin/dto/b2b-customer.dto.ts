import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class CreateB2bCustomerDto {
  @ApiProperty({ description: 'ERP Account id (Account.id)' })
  @IsString()
  erpAccountId!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerClassId?: string;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3650)
  vatDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canUseVirtualPos?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  blockOrderOnRisk?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerGrade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discountGroupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salespersonId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  erpNum?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateB2bCustomerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerClassId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3650)
  vatDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canUseVirtualPos?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  blockOrderOnRisk?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerGrade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discountGroupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salespersonId?: string;
}

export class B2bCustomerListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class B2bCustomerMovementsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class B2bFifoPreviewQueryDto {
  @ApiPropertyOptional({
    description:
      'FIFO "bugün" referansı (ISO 8601). Boşsa sunucu zamanı kullanılır.',
  })
  @IsOptional()
  @IsDateString()
  asOf?: string;

  @ApiPropertyOptional({
    enum: ['json', 'xlsx', 'pdf'],
    default: 'json',
    description: 'json: API gövdesi; xlsx / pdf: indirilebilir dosya',
  })
  @IsOptional()
  @IsIn(['json', 'xlsx', 'pdf'])
  format?: 'json' | 'xlsx' | 'pdf';
}
