import { Module } from '@nestjs/common';
import { InsumosConsumidosService } from './insumos-consumidos.service';
import { InsumosConsumidosController } from './insumos-consumidos.controller';

@Module({
  controllers: [InsumosConsumidosController],
  providers: [InsumosConsumidosService],
})
export class InsumosConsumidosModule {}
