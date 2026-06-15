import { Module } from '@nestjs/common';
import { ServicoService } from './servico.service';
import { ServicoController } from './servico.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ServicoController],
  providers: [ServicoService, PrismaService],
})
export class ServicoModule {}
