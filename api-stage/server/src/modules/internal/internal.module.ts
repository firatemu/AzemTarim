import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module';
import { InternalTlsAskController } from './internal-tls-ask.controller';

@Module({
  imports: [PrismaModule],
  controllers: [InternalTlsAskController],
})
export class InternalModule {}
