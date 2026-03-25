import { IsOptional, IsEnum, IsUUID, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { CheckBillType, PortfolioType, CheckBillStatus } from '@prisma/client';

export class CheckBillFilterDto {
    @IsOptional()
    @IsEnum(CheckBillType)
    type?: CheckBillType;

    @IsOptional()
    @IsEnum(PortfolioType)
    portfolioType?: PortfolioType;

    @IsOptional()
    @IsEnum(CheckBillStatus)
    status?: CheckBillStatus;

    @IsOptional()
    @IsUUID()
    accountId?: string;

    @IsOptional()
    @IsDateString()
    dueDateFrom?: string;

    @IsOptional()
    @IsDateString()
    dueDateTo?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isProtested?: boolean;
}
