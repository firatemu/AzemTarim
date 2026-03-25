import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../../common/prisma.module';
import { B2bAuthController } from './b2b-auth.controller';
import { B2bCatalogController } from './b2b-catalog.controller';
import { B2bCartController } from './b2b-cart.controller';
import { B2bOrderController } from './b2b-order.controller';
import { B2bAdvertisementsController } from './b2b-advertisements.controller';
import { B2bAccountController } from './b2b-account.controller';
import { B2bNotificationsController } from './b2b-notifications.controller';
import { B2bSalespersonController } from './b2b-salesperson.controller';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { B2bClaimsMatchGuard } from './guards/b2b-claims-match.guard';
import { B2bDomainGuard } from './guards/b2b-domain.guard';
import { B2bEffectiveCustomerGuard } from './guards/b2b-effective-customer.guard';
import { B2bJwtAuthGuard } from './guards/b2b-jwt-auth.guard';
import { B2bJwtStrategy } from './strategies/b2b-jwt.strategy';
import { B2bAuthService } from './services/b2b-auth.service';
import { B2bCartOrderService } from './services/b2b-cart-order.service';
import { B2bPortalActorService } from './services/b2b-portal-actor.service';
import { B2bPriceService } from './services/b2b-price.service';
import { B2bRiskCheckService } from './services/b2b-risk-check.service';
import { B2bAccountService } from './services/b2b-account.service';
import { B2bNotificationsService } from './services/b2b-notifications.service';
import { B2bTenantSchemaBridgeService } from './services/b2b-tenant-schema-bridge.service';
import { B2BFifoService } from './services/b2b-fifo.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const base =
          config.get<string>('JWT_ACCESS_SECRET') ||
          config.get<string>('JWT_SECRET') ||
          'secret';
        const secret =
          config.get<string>('B2B_JWT_SECRET') || `${base}-b2b-portal`;
        return {
          secret,
          signOptions: { expiresIn: '12h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [
    B2bAuthController,
    B2bCatalogController,
    B2bCartController,
    B2bOrderController,
    B2bAdvertisementsController,
    B2bAccountController,
    B2bNotificationsController,
    B2bSalespersonController,
  ],
  providers: [
    B2bAuthService,
    B2bPriceService,
    B2bRiskCheckService,
    B2bCartOrderService,
    B2bPortalActorService,
    B2bTenantSchemaBridgeService,
    B2BFifoService,
    B2bAccountService,
    B2bNotificationsService,
    B2bDomainGuard,
    B2BLicenseGuard,
    B2bJwtAuthGuard,
    B2bClaimsMatchGuard,
    B2bEffectiveCustomerGuard,
    B2bJwtStrategy,
  ],
})
export class B2bPortalModule {}
