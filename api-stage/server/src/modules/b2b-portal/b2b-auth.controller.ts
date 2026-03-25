import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { B2bLoginDto } from './dto/b2b-login.dto';
import { B2bAuthService } from './services/b2b-auth.service';
import { B2bDomainGuard } from './guards/b2b-domain.guard';
import { B2bJwtAuthGuard } from './guards/b2b-jwt-auth.guard';
import { B2bClaimsMatchGuard } from './guards/b2b-claims-match.guard';
import type { B2bJwtPayload } from './types/b2b-jwt-payload';
import type { Request as ExpressRequest } from 'express';

@ApiTags('B2B Portal')
@Controller('b2b/auth')
export class B2bAuthController {
  constructor(private readonly auth: B2bAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'B2B müşteri girişi (domain + email + şifre)' })
  login(@Body() dto: B2bLoginDto) {
    return this.auth.login(dto.domain, dto.email, dto.password);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Sifre sifirlama (henuz yok)' })
  forgotPassword() {
    return {
      statusCode: 501,
      message: 'B2B sifre sifirlama admin uzerinden yapilir',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({ summary: 'Refresh token (henuz yok)' })
  refresh() {
    return {
      statusCode: 501,
      message: 'B2B refresh token henuz desteklenmiyor',
    };
  }

  @Get('me')
  @UseGuards(
    B2bDomainGuard,
    B2BLicenseGuard,
    B2bJwtAuthGuard,
    B2bClaimsMatchGuard,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Oturum: musteri veya satis temsilcisi profili' })
  async me(@Request() req: ExpressRequest) {
    const user = req.user as B2bJwtPayload;
    return this.auth.getMe(user);
  }
}
