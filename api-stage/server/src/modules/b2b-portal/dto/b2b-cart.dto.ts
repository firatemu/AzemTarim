import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class B2bAddCartItemDto {
  @ApiProperty({ description: 'B2BProduct.id' })
  @IsString()
  @MinLength(1)
  productId!: string;

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class B2bUpdateCartItemDto {
  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class B2bCartItemIdParamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  itemId!: string;
}

export class B2bPlaceOrderDto {
  @ApiProperty({ description: 'B2BDeliveryMethod.id' })
  @IsString()
  @MinLength(1)
  deliveryMethodId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryBranchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryBranchName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
