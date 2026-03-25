import { ApiPropertyOptional } from '@nestjs/swagger';
import { B2BWarehouseDisplayMode } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class PatchB2bWarehouseConfigDto {
  @ApiPropertyOptional({ enum: B2BWarehouseDisplayMode })
  @IsOptional()
  @IsEnum(B2BWarehouseDisplayMode)
  displayMode?: B2BWarehouseDisplayMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
