// src/aprovacao/aprovacao.module.ts
import { Module } from '@nestjs/common';
import { EmailModule } from 'src/libs/email/email.module';
import { AprovacaoController } from './aprovar-os.controller';
import { AprovacaoService } from './aprovar-os.service';

@Module({
  imports: [EmailModule],
  controllers: [AprovacaoController],
  providers: [AprovacaoService],
})
export class AprovacaoModule {}
