import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class TestConnectionDto {
    @ApiProperty({ enum: ['OTOMUHASEBE', 'LOGO', 'MIKRO'] })
    @IsEnum(['OTOMUHASEBE', 'LOGO', 'MIKRO'])
    erpAdapterType: 'OTOMUHASEBE' | 'LOGO' | 'MIKRO';

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    server?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(65535)
    port?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    database?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    user?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    password?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    logoVersion?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    companyNo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    periodNo?: string;
}
