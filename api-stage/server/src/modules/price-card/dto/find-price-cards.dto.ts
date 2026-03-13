import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { PriceType } from './create-price-card.dto';

export class FindPriceCardsDto {
  @IsEnum(PriceType)
  @IsOptional()
  type?: PriceType;
}

export class FindAllPriceCardsDto extends FindPriceCardsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class LatestPriceQueryDto extends FindPriceCardsDto { }
