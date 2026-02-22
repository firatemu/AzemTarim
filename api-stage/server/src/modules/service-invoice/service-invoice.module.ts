import { Module, forwardRef } from '@nestjs/common';
import { ServiceInvoiceService } from './service-invoice.service';
import { ServiceInvoiceController } from './service-invoice.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';
import { CodeTemplateModule } from '../code-template/code-template.module';
import { SystemParameterModule } from '../system-parameter/system-parameter.module';

@Module({
  imports: [
    PrismaModule,
    TenantContextModule,
    forwardRef(() => CodeTemplateModule),
    SystemParameterModule,
  ],
  controllers: [ServiceInvoiceController],
  providers: [ServiceInvoiceService],
  exports: [ServiceInvoiceService],
})
export class ServiceInvoiceModule {}
