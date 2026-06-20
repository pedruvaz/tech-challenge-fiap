import { Module } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { InsumosController } from './insumos.controller';
import { InsumosRepository } from './repositories/insumos.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [InsumosController],
  providers: [InsumosService, InsumosRepository, PrismaService],
})
export class InsumosModule {}
