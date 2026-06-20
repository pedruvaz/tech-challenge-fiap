import { Module } from '@nestjs/common';
import { ServicoService } from './servico.service';
import { ServicoController } from './servico.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ServicoRepository } from './repositories/servico.repository';

@Module({
  controllers: [ServicoController],
  providers: [ServicoService, PrismaService, ServicoRepository],
})
export class ServicoModule {}
