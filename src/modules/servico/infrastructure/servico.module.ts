import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AtualizarServicoUseCase } from '../application/use-cases/atualizar-servico.use-case';
import { BuscarServicoPorIdUseCase } from '../application/use-cases/buscar-servico-por-id.use-case';
import { CriarServicoUseCase } from '../application/use-cases/criar-servico.use-case';
import { ListarServicosUseCase } from '../application/use-cases/listar-servicos.use-case';
import { RemoverServicoUseCase } from '../application/use-cases/remover-servico.use-case';
import { ServicoRepository } from '../domain/repositories/servico.repository';
import { ServicoController } from './http/servico.controller';
import { PrismaServicoRepository } from './persistence/prisma-servico.repository';

const repositoryBindings: Provider[] = [
  { provide: ServicoRepository, useClass: PrismaServicoRepository },
];

const useCaseProviders: Provider[] = [
  {
    provide: CriarServicoUseCase,
    useFactory: (repo: ServicoRepository) => new CriarServicoUseCase(repo),
    inject: [ServicoRepository],
  },
  {
    provide: ListarServicosUseCase,
    useFactory: (repo: ServicoRepository) => new ListarServicosUseCase(repo),
    inject: [ServicoRepository],
  },
  {
    provide: BuscarServicoPorIdUseCase,
    useFactory: (repo: ServicoRepository) =>
      new BuscarServicoPorIdUseCase(repo),
    inject: [ServicoRepository],
  },
  {
    provide: AtualizarServicoUseCase,
    useFactory: (repo: ServicoRepository) => new AtualizarServicoUseCase(repo),
    inject: [ServicoRepository],
  },
  {
    provide: RemoverServicoUseCase,
    useFactory: (repo: ServicoRepository) => new RemoverServicoUseCase(repo),
    inject: [ServicoRepository],
  },
];

@Module({
  imports: [PrismaModule],
  controllers: [ServicoController],
  providers: [...repositoryBindings, ...useCaseProviders],
  exports: [ServicoRepository],
})
export class ServicoModule {}
