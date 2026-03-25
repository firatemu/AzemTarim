import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class B2bLoginDto {
  @ApiProperty({
    example: 'bayi.firma.com',
    description: 'Kayitli B2B domain; musteri veya satis temsilcisi girisi',
  })
  @IsString()
  @MinLength(1)
  domain!: string;

  @ApiProperty({ example: 'musteri@firma.com' })
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;
}
