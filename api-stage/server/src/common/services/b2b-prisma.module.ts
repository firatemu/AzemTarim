import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { B2BPrismaService } from './b2b-prisma.service';

/**
 * B2B Prisma module for dynamic schema connections.
 * Marked as @Global() so it can be injected anywhere without importing.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [B2BPrismaService],
  exports: [B2BPrismaService],
})
export class B2BPrismaModule {}
