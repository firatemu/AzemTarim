import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class B2bJwtAuthGuard extends AuthGuard('b2b-jwt') {}
