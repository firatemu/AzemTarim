import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { B2bDomainGuard } from './guards/b2b-domain.guard';
import { B2bJwtAuthGuard } from './guards/b2b-jwt-auth.guard';
import { B2bClaimsMatchGuard } from './guards/b2b-claims-match.guard';
import { B2bEffectiveCustomerGuard } from './guards/b2b-effective-customer.guard';
import { B2bAddCartItemDto, B2bUpdateCartItemDto } from './dto/b2b-cart.dto';
import { B2bCartOrderService } from './services/b2b-cart-order.service';
import type { B2bJwtPayload } from './types/b2b-jwt-payload';
import type { Request } from 'express';

@ApiTags('B2B Portal')
@Controller('b2b/cart')
@UseGuards(
  B2bDomainGuard,
  B2BLicenseGuard,
  B2bJwtAuthGuard,
  B2bClaimsMatchGuard,
  B2bEffectiveCustomerGuard,
)
@ApiBearerAuth()
export class B2bCartController {
  constructor(private readonly cart: B2bCartOrderService) {}

  @Get()
  @ApiOperation({ summary: 'Sepet özeti (fiyat kırılımı ile)' })
  summary(@Req() req: Request) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.cart.getCartSummary(user.tenantId, cid);
  }

  @Delete()
  @ApiOperation({ summary: 'Sepeti temizle' })
  clear(@Req() req: Request) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.cart.clearCart(user.tenantId, cid);
  }

  @Post('items')
  @ApiOperation({ summary: 'Sepete ürün ekle' })
  add(@Req() req: Request, @Body() dto: B2bAddCartItemDto) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.cart.addItem(
      user.tenantId,
      cid,
      dto.productId,
      dto.quantity,
    );
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Sepet satırı miktarı' })
  updateQty(
    @Req() req: Request,
    @Param('itemId') itemId: string,
    @Body() dto: B2bUpdateCartItemDto,
  ) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.cart.updateItemQty(
      user.tenantId,
      cid,
      itemId,
      dto.quantity,
    );
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Sepet satırını sil' })
  remove(@Req() req: Request, @Param('itemId') itemId: string) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.cart.removeItem(user.tenantId, cid, itemId);
  }
}
