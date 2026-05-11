import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../../common/prisma.module';
import { B2BAdapterFactory } from './adapters/b2b-adapter.factory';
import { B2bSyncController } from './b2b-sync.controller';
import { B2bSyncProcessor } from './b2b-sync.processor';
import { B2B_SYNC_QUEUE, B2bSyncService } from './b2b-sync.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: B2B_SYNC_QUEUE,
    }),
  ],
  controllers: [B2bSyncController],
  providers: [
    B2bSyncService,
    B2bSyncProcessor,
    B2BAdapterFactory,
  ],
  exports: [B2bSyncService, B2BAdapterFactory],
})
export class B2bSyncModule {}
