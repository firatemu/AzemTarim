import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { BankService } from './bank.service';
import { CreateBankDto, UpdateBankDto } from './dto/create-bank.dto';
import { BankAccountCreateDto, BankAccountUpdateDto } from './dto/create-account.dto';
import { CreateBankMovementDto, CreatePosMovementDto } from './dto/create-movement.dto';
import { CreateLoanUsageDto } from './dto/create-loan.dto';
import { PayCreditInstallmentDto } from './dto/pay-credit-installment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('banks')
@UseGuards(JwtAuthGuard)
export class BankController {
    constructor(private readonly bankService: BankService) {
        console.log('BankController initialized');
    }

    @Get('ping')
    ping() {
        return 'pong';
    }

    // ============ BANK ENDPOINTS ============

    @Post()
    create(@Body() createBankDto: CreateBankDto) {
        return this.bankService.create(createBankDto);
    }

    @Get()
    findAll() {
        return this.bankService.findAll();
    }

    @Get('summary')
    getBanksSummary() {
        return this.bankService.getBanksSummary();
    }

    // ============ HAREKET ENDPOINTS ============

    @Get('accounts/:accountId/movements')
    getMovements(
        @Param('accountId') accountId: string,
        @Query('start') start?: string,
        @Query('end') end?: string,
        @Query('limit') limit?: string,
    ) {
        return this.bankService.getMovements(accountId, {
            startDate: start ? new Date(start) : undefined,
            endDate: end ? new Date(end) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }

    @Post('accounts/:accountId/movements')
    createMovement(
        @Param('accountId') accountId: string,
        @Body() dto: CreateBankMovementDto,
    ) {
        return this.bankService.createMovement(accountId, dto);
    }

    @Post('accounts/:accountId/pos-payments')
    createPosMovement(
        @Param('accountId') accountId: string,
        @Body() dto: CreatePosMovementDto,
    ) {
        return this.bankService.createPosMovement(accountId, dto);
    }

    // ============ KREDİ İŞLEMLERİ ============

    @Get('loans')
    getAllLoans() {
        return this.bankService.getAllLoans();
    }

    @Post('accounts/:accountId/loans/use')
    useLoan(
        @Param('accountId') accountId: string,
        @Body() dto: CreateLoanUsageDto,
    ) {
        return this.bankService.useLoan(accountId, dto);
    }

    @Get('accounts/:accountId/loans')
    getLoans(@Param('accountId') accountId: string) {
        return this.bankService.getLoans(accountId);
    }

    @Get('loans/:loanId')
    getLoanDetail(@Param('loanId') loanId: string) {
        return this.bankService.getLoanDetail(loanId);
    }

    @Get('credit-cards/upcoming')
    getUpcomingCreditCardDates(
        @Query('start') start?: string,
        @Query('end') end?: string,
    ) {
        return this.bankService.getUpcomingCreditCardDates(
            start ? new Date(start) : new Date(),
            end ? new Date(end) : new Date(),
        );
    }

    @Get('installments/upcoming')
    getUpcomingInstallments(
        @Query('start') start?: string,
        @Query('end') end?: string,
    ) {
        return this.bankService.getUpcomingInstallments(
            start ? new Date(start) : new Date(),
            end ? new Date(end) : new Date(),
        );
    }

    @Post('loans/:loanId/plans')
    addLoanPlan(
        @Param('loanId') loanId: string,
        @Body() dto: { amount: number; dueDate: Date | string },
    ) {
        return this.bankService.addLoanPlan(loanId, {
            amount: dto.amount,
            dueDate: new Date(dto.dueDate),
        });
    }

    @Put('loan-plans/:id')
    updateLoanPlan(
        @Param('id') id: string,
        @Body() dto: { amount?: number; dueDate?: Date | string },
    ) {
        return this.bankService.updateLoanPlan(id, {
            amount: dto.amount,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        });
    }

    @Delete('loan-plans/:id')
    deleteLoanPlan(@Param('id') id: string) {
        return this.bankService.deleteLoanPlan(id);
    }

    @Post('loan-plans/:id/payments')
    payInstallment(
        @Param('id') id: string,
        @Body() dto: PayCreditInstallmentDto,
    ) {
        return this.bankService.payInstallment(id, dto);
    }

    // ============ HESAP İŞLEMLERİ ============

    @Get('accounts')
    findAllAccounts() {
        return this.bankService.findAllAccounts();
    }

    @Post(':id/accounts')
    createAccount(
        @Param('id') id: string,
        @Body() dto: BankAccountCreateDto,
    ) {
        return this.bankService.createAccount(id, dto);
    }

    @Get('accounts/:id')
    findAccount(@Param('id') id: string) {
        return this.bankService.findAccount(id);
    }

    @Put('accounts/:id')
    updateAccount(
        @Param('id') id: string,
        @Body() dto: BankAccountUpdateDto,
    ) {
        return this.bankService.updateAccount(id, dto);
    }

    @Delete('accounts/:id')
    removeAccount(@Param('id') id: string) {
        return this.bankService.removeAccount(id);
    }

    // ============ GENERIC BANK ENDPOINTS ============

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bankService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto) {
        return this.bankService.update(id, updateBankDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bankService.remove(id);
    }
}
