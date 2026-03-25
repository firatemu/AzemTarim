import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateB2bSalespersonDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canViewAllCustomers?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canViewAllReports?: boolean;
}

export class UpdateB2bSalespersonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canViewAllCustomers?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canViewAllReports?: boolean;
}

export class AssignB2bCustomersDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  customerIds!: string[];
}
