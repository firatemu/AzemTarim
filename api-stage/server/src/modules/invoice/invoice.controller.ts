import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, Res, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiParam } from '@nestjs/swagger';
import { InvoiceType, InvoiceStatus } from './invoice.enums';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoicePaymentPlanDto } from './dto/create-invoice-payment-plan.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceService } from './invoice.service';
import { InvoiceExportService } from './invoice-export.service';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoiceExportService: InvoiceExportService,
  ) { }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'invoiceType', enum: InvoiceType, required: false })
  async getStats(@Query('invoiceType') invoiceType?: string) {
    return this.invoiceService.getSalesStats(invoiceType as InvoiceType);
  }

  @Get('due-date-analysis')
  @UseGuards(JwtAuthGuard)
  async getDueDateAnalysis(@Query('accountId') accountId?: string) {
    return this.invoiceService.getDueDateAnalysis(accountId);
  }

  @Get('price-history')
  @UseGuards(JwtAuthGuard)
  async getPriceHistory(
    @Query('accountId') accountId: string,
    @Query('productId') productId: string,
  ) {
    return this.invoiceService.getPriceHistory(accountId, productId);
  }

  @Get('exchange-rate')
  @UseGuards(JwtAuthGuard)
  async getExchangeRate(@Query('currency') currency: string) {
    const rate = await this.invoiceService.getExchangeRate(currency);
    return { rate };
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard)
  async exportExcel(
    @Query('invoiceType') type: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('status') status: string,
    @Query('search') search: string,
    @Query('salesAgentId') salesAgentId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.invoiceExportService.generateSalesInvoiceExcel(
      type as InvoiceType || undefined,
      startDate || undefined,
      endDate || undefined,
      status || undefined,
      search || undefined,
      salesAgentId || undefined,
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=faturalar_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  }

  @Get()
  @ApiQuery({ name: 'type', enum: InvoiceType, required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('accountId') accountId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('salesAgentId') salesAgentId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;

    try {
      const result = await this.invoiceService.findAllAdvanced(
        pageNum,
        limitNum,
        type as InvoiceType | undefined,
        search,
        accountId,
        sortBy,
        sortOrder,
        startDate,
        endDate,
        status as any,
        salesAgentId,
      );

      return {
        data: result.data,
        meta: result.meta,
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createFaturaDto: CreateInvoiceDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.create(createFaturaDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('bulk/status')
  async bulkUpdateDurum(
    @Body() body: { ids: string[]; status: InvoiceStatus },
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.bulkUpdateStatus(body.ids, body.status, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFaturaDto: UpdateInvoiceDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.update(id, updateFaturaDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.remove(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/status')
  async changeDurum(
    @Param('id') id: string,
    @Body() body: { status: InvoiceStatus },
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.changeStatus(id, body.status, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body() body: { deliveryNoteIptal?: boolean },
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.invoiceService.cancel(id, userId, undefined, undefined, body.deliveryNoteIptal);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/material-preparation')
  async getMaterialPreparation(@Param('id') id: string) {
    return this.invoiceService.getMaterialPreparationSlip(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/payment-plan')
  async addPaymentPlan(
    @Param('id') id: string,
    @Body() body: CreateInvoicePaymentPlanDto[],
  ) {
    return this.invoiceService.createPaymentPlan(id, body);
  }
}