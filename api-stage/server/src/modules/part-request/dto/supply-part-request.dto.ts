import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class SupplyPartRequestDto {
  @IsNotEmpty()
  @IsString()
  stokId: string;

  @IsNumber()
  @Min(1)
  suppliedQty: number;
}
