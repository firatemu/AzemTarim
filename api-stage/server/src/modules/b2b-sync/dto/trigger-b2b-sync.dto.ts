import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { B2BSyncType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class TriggerB2bSyncDto {
  @ApiProperty({ enum: B2BSyncType })
  @IsEnum(B2BSyncType)
  syncType!: B2BSyncType;

  @ApiPropertyOptional({
    description: 'B2B cari eşlemesi için ERP cari id (ACCOUNT_MOVEMENTS)',
  })
  @IsOptional()
  @IsString()
  erpAccountId?: string;
}

export class ExportB2bOrderDto {
  @ApiProperty()
  @IsString()
  orderId!: string;
}
