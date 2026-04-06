import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    Query,
    UseGuards,
    Request,
    Res,
    NotImplementedException,
    BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { CheckBillService } from './check-bill.service';
import { CreateCheckBillDto, UpdateCheckBillDto } from './dto/create-check-bill.dto';
import { CheckBillActionDto } from './dto/check-bill-transaction.dto';
import { CheckBillFilterDto } from './dto/check-bill-filter.dto';
import { CheckBillBulkActionDto } from './dto/check-bill-bulk.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';

@Controller('checks-promissory-notes')
@UseGuards(JwtAuthGuard)
export class CheckBillController {
    constructor(private readonly checkBillService: CheckBillService) {}

    @Get('stats/summary')
    getStatsSummary() {
        return this.checkBillService.getStatsSummary();
    }

    @Get('stats/aging')
    getStatsAging() {
        return this.checkBillService.getStatsAging();
    }

    @Get('stats/cashflow')
    getStatsCashflow() {
        return this.checkBillService.getStatsCashflow();
    }

    @Get('export/excel')
    async exportExcel(@Query() filter: CheckBillFilterDto, @Res() res: Response) {
        const buffer = await this.checkBillService.exportExcel(filter);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="cek-senet-listesi.xlsx"');
        res.send(buffer);
    }

    @Get('export/pdf')
    async exportPdf(@Query() filter: CheckBillFilterDto, @Res() res: Response) {
        const buffer = await this.checkBillService.exportExcel(filter);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="cek-senet-listesi.pdf"');
        res.send(buffer);
    }

    @Get('health')
    async healthCheck() {
        try {
            await this.checkBillService.getOverdue();
            return { status: 'ok', message: 'Database connection working' };
        } catch (error: any) {
            console.error('[CheckBillController] health check error:', error);
            return { status: 'error', message: error.message };
        }
    }

    @Get()
    findAll(@Query() filter: CheckBillFilterDto) {
        return this.checkBillService.findAll(filter);
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.TENANT_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
    create(@Body() dto: CreateCheckBillDto, @Request() req: { user: { id: string } }) {
        return this.checkBillService.create(dto, undefined, req.user.id);
    }

    @Post('bulk-action')
    @UseGuards(RolesGuard)
    @Roles(UserRole.TENANT_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
    bulkAction(@Body() dto: CheckBillBulkActionDto, @Request() req: { user: { id: string } }) {
        if (dto.action !== 'soft_delete') {
            throw new BadRequestException('Desteklenmeyen aksiyon');
        }
        return this.checkBillService.bulkSoftDelete(dto.checkBillIds, req.user.id);
    }

    @Post('import')
    @UseGuards(RolesGuard)
    @Roles(UserRole.TENANT_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
    importDocuments() {
        throw new NotImplementedException(
            'Excel/CSV toplu içe aktarma için şablon ve doğrulama yakında eklenecek.',
        );
    }

    @Get('upcoming')
    async getUpcomingChecks(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
        try {
            let start = startDate ? new Date(startDate) : new Date();
            let end = endDate ? new Date(endDate) : new Date();
            if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
                throw new BadRequestException('Geçersiz startDate veya endDate');
            }
            if (start.getTime() > end.getTime()) {
                const t = start;
                start = end;
                end = t;
            }
            return await this.checkBillService.getUpcomingChecks(start, end);
        } catch (error: any) {
            console.error('[CheckBillController] getUpcomingChecks error:', error);
            throw error;
        }
    }

    @Get('overdue')
    async getOverdue() {
        try {
            return await this.checkBillService.getOverdue();
        } catch (error: any) {
            console.error('[CheckBillController] getOverdue error:', error);
            throw error;
        }
    }

    @Get('at-risk')
    async getAtRisk(@Query('minScore') minScore?: string) {
        try {
            const n = minScore ? parseInt(minScore, 10) : 70;
            return await this.checkBillService.getAtRisk(Number.isFinite(n) ? n : 70);
        } catch (error: any) {
            console.error('[CheckBillController] getAtRisk error:', error);
            throw error;
        }
    }

    /** Doc §5.1: /:id/endorsements — eski `endorsements/:id` ile birlikte */
    @Get([':id/endorsements', 'endorsements/:id'])
    getEndorsements(@Param('id') id: string) {
        return this.checkBillService.getEndorsements(id);
    }

    @Get([':id/collections', 'collections/:id'])
    getCollectionHistory(@Param('id') id: string) {
        return this.checkBillService.getCollectionHistory(id);
    }

    @Get(':id/timeline')
    getTimeline(@Param('id') id: string) {
        return this.checkBillService.getTimeline(id);
    }

    @Get(':id/gl-entries')
    getGlEntries(@Param('id') id: string) {
        return this.checkBillService.getGlEntriesForCheckBill(id);
    }

    @Get(':id/documents')
    getDocuments(@Param('id') id: string) {
        return this.checkBillService.getDocuments(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.checkBillService.findOne(id);
    }

    @Put(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.TENANT_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
    update(@Param('id') id: string, @Body() dto: UpdateCheckBillDto) {
        return this.checkBillService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.TENANT_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
    remove(@Param('id') id: string) {
        return this.checkBillService.remove(id);
    }

    @Post('action')
    @UseGuards(RolesGuard)
    @Roles(UserRole.TENANT_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
    processAction(@Body() dto: CheckBillActionDto, @Request() req: { user: { id: string } }) {
        return this.checkBillService.processAction(dto, req.user.id);
    }
}
