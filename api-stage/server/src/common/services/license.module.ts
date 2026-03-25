import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { B2bLicenseCacheService } from './b2b-license-cache.service';
import { LicenseService } from './license.service';
import { RedisModule } from './redis.module';

@Global()
@Module({
  imports: [PrismaModule, RedisModule],
  providers: [LicenseService, B2bLicenseCacheService],
  exports: [LicenseService, B2bLicenseCacheService],
})
export class LicenseModule {}


