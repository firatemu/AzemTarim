import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class B2bReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ enum: ['json', 'xlsx'] })
  @IsOptional()
  @IsEnum(['json', 'xlsx'] as const)
  format?: 'json' | 'xlsx';
}
