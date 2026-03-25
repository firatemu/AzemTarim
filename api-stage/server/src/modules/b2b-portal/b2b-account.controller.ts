import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { B2bDomainGuard } from './guards/b2b-domain.guard';
import { B2bJwtAuthGuard } from './guards/b2b-jwt-auth.guard';
import { B2bClaimsMatchGuard } from './guards/b2b-claims-match.guard';
import { B2bEffectiveCustomerGuard } from './guards/b2b-effective-customer.guard';
import {
  B2bAccountMovementsExportQueryDto,
  B2bAccountMovementsQueryDto,
} from './dto/b2b-account.dto';
import { B2bAccountService } from './services/b2b-account.service';
import type { B2bJwtPayload } from './types/b2b-jwt-payload';
import type { Request } from 'express';

@ApiTags('B2B Portal')
@Controller('b2b/account')
@UseGuards(
  B2bDomainGuard,
  B2BLicenseGuard,
  B2bJwtAuthGuard,
  B2bClaimsMatchGuard,
  B2bEffectiveCustomerGuard,
)
@ApiBearerAuth()
export class B2bAccountController {
  constructor(private readonly account: B2bAccountService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Cari ozet ve acik siparis sayisi' })
  summary(@Req() req: Request) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.account.getSummary(user.tenantId, cid);
  }

  @Get('movements')
  @ApiOperation({ summary: 'B2B senkron cari hareketler' })
  movements(@Req() req: Request, @Query() q: B2bAccountMovementsQueryDto) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.account.listMovements(user.tenantId, cid, q);
  }

  @Get('movements/export')
  @ApiOperation({
    summary: 'Cari hareketler Excel (FIFO sütunları)',
    description:
      'Tarih filtresi opsiyonel. En fazla maxRows satır (varsayılan 5000, üst sınır 10000).',
  })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  async exportMovements(
    @Req() req: Request,
    @Query() q: B2bAccountMovementsExportQueryDto,
    @Res() res: Response,
  ) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    const buf = await this.account.exportMovementsXlsx(user.tenantId, cid, q);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=b2b-account-movements.xlsx',
      'Content-Length': buf.length,
    });
    return res.end(buf);
  }

  @Get('risk')
  @ApiOperation({ summary: 'Risk / limit ozeti (dashboard)' })
  risk(@Req() req: Request) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.account.getRiskSnapshot(user.tenantId, cid);
  }
}
