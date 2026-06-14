import { Module } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { InsumosController } from './insumos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insumo } from './entities/insumo.entity';

@Module({
  controllers: [InsumosController],
  providers: [InsumosService],
})
export class InsumosModule {}
