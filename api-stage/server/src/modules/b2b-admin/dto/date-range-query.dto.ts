import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional } from 'class-validator';

export class DateRangeQueryDto {
  @ApiPropertyOptional({ description: 'ISO tarih (başlangıç)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO tarih (bitiş)' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
