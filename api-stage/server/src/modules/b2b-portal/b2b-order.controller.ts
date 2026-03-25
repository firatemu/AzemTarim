import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { B2bDomainGuard } from './guards/b2b-domain.guard';
import { B2bJwtAuthGuard } from './guards/b2b-jwt-auth.guard';
import { B2bClaimsMatchGuard } from './guards/b2b-claims-match.guard';
import { B2bEffectiveCustomerGuard } from './guards/b2b-effective-customer.guard';
import { B2bPlaceOrderDto } from './dto/b2b-cart.dto';
import { B2bOrderListQueryDto } from './dto/b2b-order-list.dto';
import { B2bCartOrderService } from './services/b2b-cart-order.service';
import type { B2bJwtPayload } from './types/b2b-jwt-payload';
import type { Request } from 'express';

@ApiTags('B2B Portal')
@Controller('b2b/orders')
@UseGuards(
  B2bDomainGuard,
  B2BLicenseGuard,
  B2bJwtAuthGuard,
  B2bClaimsMatchGuard,
  B2bEffectiveCustomerGuard,
)
@ApiBearerAuth()
export class B2bOrderController {
  constructor(private readonly cartOrder: B2bCartOrderService) {}

  @Get()
  @ApiOperation({ summary: 'Sipariş listesi' })
  list(@Req() req: Request, @Query() q: B2bOrderListQueryDto) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.cartOrder.listOrders(user.tenantId, cid, {
      page: q.page,
      pageSize: q.pageSize,
      status: q.status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Sipariş detayı' })
  one(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.cartOrder.getOrder(user.tenantId, cid, id);
  }

  @Post()
  @ApiOperation({ summary: 'Sepetten sipariş oluştur' })
  place(@Req() req: Request, @Body() dto: B2bPlaceOrderDto) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.cartOrder.placeOrder(user.tenantId, user, cid, dto);
  }
}
