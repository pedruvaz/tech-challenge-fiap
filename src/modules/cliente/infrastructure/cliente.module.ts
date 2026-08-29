import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AtualizarClienteUseCase } from '../application/use-cases/atualizar-cliente.use-case';
import { BuscarClientePorIdUseCase } from '../application/use-cases/buscar-cliente-por-id.use-case';
import { CriarClienteUseCase } from '../application/use-cases/criar-cliente.use-case';
import { ListarClientesUseCase } from '../application/use-cases/listar-clientes.use-case';
import { RemoverClienteUseCase } from '../application/use-cases/remover-cliente.use-case';
import { ClienteRepository } from '../domain/repositories/cliente.repository';
import { ClienteController } from './http/cliente.controller';
import { PrismaClienteRepository } from './persistence/prisma-cliente.repository';

const repositoryBindings: Provider[] = [
  { provide: ClienteRepository, useClass: PrismaClienteRepository },
];

// Use cases como classes puras (sem @Injectable) — instanciamos via factory
// para preservar a separação Clean Architecture entre application e NestJS.
const useCaseProviders: Provider[] = [
  {
    provide: CriarClienteUseCase,
    useFactory: (repo: ClienteRepository) => new CriarClienteUseCase(repo),
    inject: [ClienteRepository],
  },
  {
    provide: ListarClientesUseCase,
    useFactory: (repo: ClienteRepository) => new ListarClientesUseCase(repo),
    inject: [ClienteRepository],
  },
  {
    provide: BuscarClientePorIdUseCase,
    useFactory: (repo: ClienteRepository) =>
      new BuscarClientePorIdUseCase(repo),
    inject: [ClienteRepository],
  },
  {
    provide: AtualizarClienteUseCase,
    useFactory: (repo: ClienteRepository) => new AtualizarClienteUseCase(repo),
    inject: [ClienteRepository],
  },
  {
    provide: RemoverClienteUseCase,
    useFactory: (repo: ClienteRepository) => new RemoverClienteUseCase(repo),
    inject: [ClienteRepository],
  },
];

@Module({
  imports: [PrismaModule],
  controllers: [ClienteController],
  providers: [...repositoryBindings, ...useCaseProviders],
  // Exportamos o port ClienteRepository e o use case de busca para que
  // outros módulos (ex.: veiculo) validem existência sem depender do Prisma.
  exports: [ClienteRepository, BuscarClientePorIdUseCase],
})
export class ClienteModule {}
