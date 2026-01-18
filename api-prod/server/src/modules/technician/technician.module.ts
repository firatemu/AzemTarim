import { Module } from '@nestjs/common';
import { TechnicianController } from './technician.controller';
import { TechnicianService } from './technician.service';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  controllers: [TechnicianController],
  providers: [TechnicianService, PrismaService, TenantContextService],
  exports: [TechnicianService],
})
export class TechnicianModule {}

