import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { B2BAdType } from '@prisma/client';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { PrismaService } from '../../common/prisma.service';
import { B2B_DOMAIN_HEADER } from './constants';
import { B2bDomainGuard } from './guards/b2b-domain.guard';
import type { Request } from 'express';

/**
 * Login oncesi popup / banner icin JWT gerekmez; yalnizca x-b2b-domain ile tenant cozulur.
 */
@ApiTags('B2B Portal')
@Controller('b2b/advertisements')
@UseGuards(B2bDomainGuard, B2BLicenseGuard)
@ApiHeader({ name: B2B_DOMAIN_HEADER, required: true })
export class B2bAdvertisementsController {
  constructor(private readonly prisma: PrismaService) {}

  private activeAdWhere(tenantId: string, type: B2BAdType) {
    const now = new Date();
    return {
      tenantId,
      type,
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    };
  }

  @Get('banners')
  @ApiOperation({ summary: 'Ana sayfa bannerlari (domain)' })
  async banners(@Req() req: Request) {
    const tenantId = req.b2bTenantId as string;
    return this.prisma.b2BAdvertisement.findMany({
      where: this.activeAdWhere(tenantId, B2BAdType.HOMEPAGE_BANNER),
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        imageUrl: true,
        linkUrl: true,
        displayOrder: true,
      },
    });
  }

  @Get('popup')
  @ApiOperation({ summary: 'Giris popup reklami (domain)' })
  async popup(@Req() req: Request) {
    const tenantId = req.b2bTenantId as string;
    return this.prisma.b2BAdvertisement.findFirst({
      where: this.activeAdWhere(tenantId, B2BAdType.LOGIN_POPUP),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        imageUrl: true,
        linkUrl: true,
      },
    });
  }
}
