import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTechnicianDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  department: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
