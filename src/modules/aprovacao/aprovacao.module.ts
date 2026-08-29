import { Module } from '@nestjs/common';
import { EmailModule } from '../../libs/email/email.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AprovacaoController } from './aprovacao.controller';
import { AprovacaoService } from './aprovacao.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [AprovacaoController],
  providers: [AprovacaoService],
})
export class AprovacaoModule {}
