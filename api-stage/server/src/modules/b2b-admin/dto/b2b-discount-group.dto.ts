import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateB2bDiscountGroupDto {
  @ApiProperty()
  @IsString()
  name!: string;
}

export class UpdateB2bDiscountGroupDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
