import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module';
import { B2BLicenseGuard } from '../../common/guards/b2b-license.guard';
import { StorageModule } from '../storage/storage.module';
import { B2bSyncModule } from '../b2b-sync/b2b-sync.module';
import { B2bAdminAdvertisementsController } from './b2b-admin-advertisements.controller';
import { B2bAdminCustomerClassesController } from './b2b-admin-customer-classes.controller';
import { B2bAdminCustomersController } from './b2b-admin-customers.controller';
import { B2bAdminDeliveryMethodsController } from './b2b-admin-delivery-methods.controller';
import { B2bAdminDiscountsController } from './b2b-admin-discounts.controller';
import { B2bAdminOrdersController } from './b2b-admin-orders.controller';
import { B2bAdminProductsController } from './b2b-admin-products.controller';
import { B2bAdminReportsController } from './b2b-admin-reports.controller';
import { B2bAdminSalespersonsController } from './b2b-admin-salespersons.controller';
import { B2bAdminSettingsController } from './b2b-admin-settings.controller';
import { B2bAdminAdvertisementService } from './services/b2b-admin-advertisement.service';
import { B2bAdminCustomerClassService } from './services/b2b-admin-customer-class.service';
import { B2bAdminCustomerService } from './services/b2b-admin-customer.service';
import { B2bAdminDeliveryService } from './services/b2b-admin-delivery.service';
import { B2bAdminDiscountService } from './services/b2b-admin-discount.service';
import { B2bAdminOrderService } from './services/b2b-admin-order.service';
import { B2bAdminProductService } from './services/b2b-admin-product.service';
import { B2bAdminReportService } from './services/b2b-admin-report.service';
import { B2bAdminSalespersonService } from './services/b2b-admin-salesperson.service';
import { B2BFifoService } from '../b2b-portal/services/b2b-fifo.service';
import { B2BSchemaProvisioningService } from './services/b2b-schema-provisioning.service';

@Module({
  imports: [PrismaModule, StorageModule, B2bSyncModule],
  controllers: [
    B2bAdminSettingsController,
    B2bAdminCustomersController,
    B2bAdminCustomerClassesController,
    B2bAdminSalespersonsController,
    B2bAdminProductsController,
    B2bAdminDiscountsController,
    B2bAdminOrdersController,
    B2bAdminDeliveryMethodsController,
    B2bAdminAdvertisementsController,
    B2bAdminReportsController,
  ],
  providers: [
    B2BLicenseGuard,
    B2BFifoService,
    B2BSchemaProvisioningService,
    B2bAdminCustomerService,
    B2bAdminCustomerClassService,
    B2bAdminSalespersonService,
    B2bAdminProductService,
    B2bAdminDiscountService,
    B2bAdminOrderService,
    B2bAdminDeliveryService,
    B2bAdminAdvertisementService,
    B2bAdminReportService,
  ],
  exports: [B2BLicenseGuard, B2BSchemaProvisioningService],
})
export class B2bAdminModule {}
