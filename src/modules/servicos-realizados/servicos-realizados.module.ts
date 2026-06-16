import { Module } from '@nestjs/common';
import { ServicosRealizadosService } from './servicos-realizados.service';
import { ServicosRealizadosController } from './servicos-realizados.controller';
import { ServicosRealizadosRepository } from './repositories/servicos-realizados.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ServicosRealizadosController],
  providers: [
    ServicosRealizadosService,
    ServicosRealizadosRepository,
    PrismaService,
  ],
})
export class ServicosRealizadosModule {}
