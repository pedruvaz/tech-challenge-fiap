import { Module } from '@nestjs/common';
import { VeiculoController } from './veiculo.controller';
import { VeiculoRepository } from './veiculo.repository';
import { VeiculoService } from './veiculo.service';

@Module({
  controllers: [VeiculoController],
  providers: [VeiculoService, VeiculoRepository],
  exports: [VeiculoService],
})
export class VeiculoModule {}
