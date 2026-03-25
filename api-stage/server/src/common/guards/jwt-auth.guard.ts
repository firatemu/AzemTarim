import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // B2B Portal kendi JWT + domain guard'larını kullanır (ERP JWT gerekmez)
    const req = context.switchToHttp().getRequest<{ path?: string; originalUrl?: string; url?: string }>();
    const path =
      (req.path || req.originalUrl || req.url || '').split('?')[0] || '';
    if (path.startsWith('/api/b2b') || path.startsWith('/b2b')) {
      return true;
    }

    if (path.startsWith('/api/internal/')) {
      return true;
    }

    return super.canActivate(context);
  }
}
