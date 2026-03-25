import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { CheckBillType, PortfolioType } from '@prisma/client';

export class CreateCheckBillDto {
    @IsEnum(CheckBillType)
    type: CheckBillType;

    @IsString()
    @IsNotEmpty()
    checkNo: string;

    @IsDateString()
    dueDate: string;

    @IsString()
    @IsOptional()
    serialNo?: string;

    @IsEnum(PortfolioType)
    portfolioType: PortfolioType;


    @IsNumber()
    @Min(0)
    amount: number;

    @IsString()
    @IsOptional()
    debtor?: string;

    @IsString()
    @IsOptional()
    bank?: string;

    @IsString()
    @IsOptional()
    branch?: string;

    @IsString()
    @IsOptional()
    accountNo?: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdateCheckBillDto {
    @IsString()
    @IsOptional()
    checkNo?: string;

    @IsDateString()
    @IsOptional()
    dueDate?: string;

    @IsString()
    @IsOptional()
    debtor?: string;

    @IsString()
    @IsOptional()
    bank?: string;

    @IsString()
    @IsOptional()
    branch?: string;

    @IsString()
    @IsOptional()
    accountNo?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    amount?: number;
}
