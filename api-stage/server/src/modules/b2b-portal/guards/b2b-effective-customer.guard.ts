import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { B2bJwtPayload } from '../types/b2b-jwt-payload';
import { B2bPortalActorService } from '../services/b2b-portal-actor.service';

@Injectable()
export class B2bEffectiveCustomerGuard implements CanActivate {
  constructor(private readonly actor: B2bPortalActorService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<import('express').Request>();
    const user = req.user as B2bJwtPayload;
    req.effectiveB2bCustomerId = await this.actor.resolveEffectiveCustomerId(
      req,
      user,
    );
    return true;
  }
}
