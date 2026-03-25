import {
  Controller,
  Get,
  Param,
  Patch,
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
import { B2bNotifListQueryDto } from './dto/b2b-notifications.dto';
import { B2bNotificationsService } from './services/b2b-notifications.service';
import type { B2bJwtPayload } from './types/b2b-jwt-payload';
import type { Request } from 'express';

@ApiTags('B2B Portal')
@Controller('b2b/notifications')
@UseGuards(
  B2bDomainGuard,
  B2BLicenseGuard,
  B2bJwtAuthGuard,
  B2bClaimsMatchGuard,
  B2bEffectiveCustomerGuard,
)
@ApiBearerAuth()
export class B2bNotificationsController {
  constructor(private readonly notifications: B2bNotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Bildirim listesi' })
  list(@Req() req: Request, @Query() q: B2bNotifListQueryDto) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.notifications.list(
      user.tenantId,
      cid,
      q.page,
      q.pageSize,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Okunmamis bildirim sayisi' })
  unread(@Req() req: Request) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.notifications.unreadCount(user.tenantId, cid);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Tumunu okundu isaretle' })
  markAll(@Req() req: Request) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.notifications.markAllRead(user.tenantId, cid);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Bildirimi okundu isaretle' })
  markRead(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as B2bJwtPayload;
    const cid = req.effectiveB2bCustomerId as string;
    return this.notifications.markRead(user.tenantId, cid, id);
  }
}
