import { Module } from '@nestjs/common';
import { ClienteModule } from '../../modules/cliente/infrastructure/cliente.module';
import { VeiculoController } from './veiculo.controller';
import { VeiculoRepository } from './veiculo.repository';
import { VeiculoService } from './veiculo.service';

@Module({
  imports: [ClienteModule],
  controllers: [VeiculoController],
  providers: [VeiculoService, VeiculoRepository],
  exports: [VeiculoService],
})
export class VeiculoModule {}
