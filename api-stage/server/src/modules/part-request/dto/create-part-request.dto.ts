import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreatePartRequestDto {
  @IsNotEmpty()
  @IsString()
  workOrderId: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  stokId?: string;

  @IsNumber()
  @Min(1)
  requestedQty: number;
}
