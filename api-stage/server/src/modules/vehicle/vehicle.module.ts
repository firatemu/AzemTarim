import { Module } from '@nestjs/common';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Module({
  controllers: [VehicleController],
  providers: [VehicleService, PrismaService, TenantContextService],
  exports: [VehicleService],
})
export class VehicleModule {}

