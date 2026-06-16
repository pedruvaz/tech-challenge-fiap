import { Module } from '@nestjs/common';
import { InsumosConsumidosService } from './insumos-consumidos.service';
import { InsumosConsumidosController } from './insumos-consumidos.controller';
import { InsumosConsumidosRepository } from './repositories/insumos-consumidos.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [InsumosConsumidosController],
  providers: [
    InsumosConsumidosService,
    InsumosConsumidosRepository,
    PrismaService,
  ],
})
export class InsumosConsumidosModule {}
