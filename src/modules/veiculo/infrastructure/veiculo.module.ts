import { Module, Provider } from '@nestjs/common';
import { ClienteRepository } from '../../cliente/domain/repositories/cliente.repository';
import { ClienteModule } from '../../cliente/infrastructure/cliente.module';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AtualizarVeiculoUseCase } from '../application/use-cases/atualizar-veiculo.use-case';
import { BuscarVeiculoPorIdUseCase } from '../application/use-cases/buscar-veiculo-por-id.use-case';
import { CriarVeiculoUseCase } from '../application/use-cases/criar-veiculo.use-case';
import { ListarVeiculosUseCase } from '../application/use-cases/listar-veiculos.use-case';
import { RemoverVeiculoUseCase } from '../application/use-cases/remover-veiculo.use-case';
import { VeiculoRepository } from '../domain/repositories/veiculo.repository';
import { VeiculoController } from './http/veiculo.controller';
import { PrismaVeiculoRepository } from './persistence/prisma-veiculo.repository';

const repositoryBindings: Provider[] = [
  { provide: VeiculoRepository, useClass: PrismaVeiculoRepository },
];

// Use cases como classes puras (sem @Injectable) — instanciamos via factory
// para preservar a separação Clean Architecture entre application e NestJS.
const useCaseProviders: Provider[] = [
  {
    provide: CriarVeiculoUseCase,
    useFactory: (repo: VeiculoRepository, clienteRepo: ClienteRepository) =>
      new CriarVeiculoUseCase(repo, clienteRepo),
    inject: [VeiculoRepository, ClienteRepository],
  },
  {
    provide: ListarVeiculosUseCase,
    useFactory: (repo: VeiculoRepository) => new ListarVeiculosUseCase(repo),
    inject: [VeiculoRepository],
  },
  {
    provide: BuscarVeiculoPorIdUseCase,
    useFactory: (repo: VeiculoRepository) =>
      new BuscarVeiculoPorIdUseCase(repo),
    inject: [VeiculoRepository],
  },
  {
    provide: AtualizarVeiculoUseCase,
    useFactory: (repo: VeiculoRepository) => new AtualizarVeiculoUseCase(repo),
    inject: [VeiculoRepository],
  },
  {
    provide: RemoverVeiculoUseCase,
    useFactory: (repo: VeiculoRepository) => new RemoverVeiculoUseCase(repo),
    inject: [VeiculoRepository],
  },
];

@Module({
  imports: [PrismaModule, ClienteModule],
  controllers: [VeiculoController],
  providers: [...repositoryBindings, ...useCaseProviders],
  // Exportamos o port VeiculoRepository para consumidores externos poderem
  // depender apenas da abstração (sem acoplar-se ao Prisma).
  exports: [VeiculoRepository],
})
export class VeiculoModule {}
