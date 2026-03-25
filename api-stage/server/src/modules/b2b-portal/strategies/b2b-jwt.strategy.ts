import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { B2bJwtPayload } from '../types/b2b-jwt-payload';

@Injectable()
export class B2bJwtStrategy extends PassportStrategy(Strategy, 'b2b-jwt') {
  constructor(config: ConfigService) {
    const base =
      config.get<string>('JWT_ACCESS_SECRET') ||
      config.get<string>('JWT_SECRET') ||
      'secret';
    const secret =
      config.get<string>('B2B_JWT_SECRET') || `${base}-b2b-portal`;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: B2bJwtPayload): B2bJwtPayload {
    if (!payload?.sub || !payload?.tenantId || !payload?.b2bDomainId) {
      throw new UnauthorizedException('Geçersiz B2B oturumu');
    }
    return payload;
  }
}
