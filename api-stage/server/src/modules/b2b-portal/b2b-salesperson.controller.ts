import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { PrismaService } from '../../common/prisma.service';
import { B2bDomainGuard } from './guards/b2b-domain.guard';
import { B2bJwtAuthGuard } from './guards/b2b-jwt-auth.guard';
import { B2bClaimsMatchGuard } from './guards/b2b-claims-match.guard';
import { B2bOrderListQueryDto } from './dto/b2b-order-list.dto';
import { B2bCartOrderService } from './services/b2b-cart-order.service';
import type { B2bJwtPayload } from './types/b2b-jwt-payload';
import type { Request } from 'express';

@ApiTags('B2B Portal')
@Controller('b2b/salesperson')
@UseGuards(
  B2bDomainGuard,
  B2BLicenseGuard,
  B2bJwtAuthGuard,
  B2bClaimsMatchGuard,
)
@ApiBearerAuth()
export class B2bSalespersonController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartOrder: B2bCartOrderService,
  ) {}

  private assertSp(user: B2bJwtPayload) {
    if (user.userType !== 'SALESPERSON') {
      throw new ForbiddenException('Yalnizca satis temsilcisi');
    }
  }

  @Get('my-customers')
  @ApiOperation({ summary: 'Atanan musteriler (veya tumu)' })
  async myCustomers(@Req() req: Request) {
    const user = req.user as B2bJwtPayload;
    this.assertSp(user);
    const sp = await this.prisma.b2BSalesperson.findFirst({
      where: { id: user.sub, tenantId: user.tenantId },
      select: { canViewAllCustomers: true },
    });
    if (!sp) {
      throw new ForbiddenException();
    }
    if (sp.canViewAllCustomers) {
      return this.prisma.b2BCustomer.findMany({
        where: { tenantId: user.tenantId, isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          customerClass: { select: { id: true, name: true } },
        },
      });
    }
    const links = await this.prisma.b2BSalespersonCustomer.findMany({
      where: { salespersonId: user.sub },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            customerClass: { select: { id: true, name: true } },
          },
        },
      },
    });
    return links
      .map((l) => l.customer)
      .filter((c) => c.isActive);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Temsilci olarak actiginiz siparisler' })
  myOrders(@Req() req: Request, @Query() q: B2bOrderListQueryDto) {
    const user = req.user as B2bJwtPayload;
    this.assertSp(user);
    return this.cartOrder.listSalespersonOrders(user.tenantId, user.sub, {
      page: q.page,
      pageSize: q.pageSize,
      status: q.status,
    });
  }
}
