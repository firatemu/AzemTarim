import { Injectable } from '@nestjs/common';
import { Request } from 'express';

/**
 * @deprecated This middleware is a stub - B2B functionality has been removed
 */
@Injectable()
export class TenantMiddleware {
  use(req: Request, res: any, next: () => void) {
    next();
  }
}
