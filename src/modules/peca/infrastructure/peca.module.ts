import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AtualizarPecaUseCase } from '../application/use-cases/atualizar-peca.use-case';
import { BuscarPecaPorIdUseCase } from '../application/use-cases/buscar-peca-por-id.use-case';
import { CriarPecaUseCase } from '../application/use-cases/criar-peca.use-case';
import { ListarPecasUseCase } from '../application/use-cases/listar-pecas.use-case';
import { RemoverPecaUseCase } from '../application/use-cases/remover-peca.use-case';
import { PecaRepository } from '../domain/repositories/peca.repository';
import { PecaController } from './http/peca.controller';
import { PrismaPecaRepository } from './persistence/prisma-peca.repository';

const repositoryBindings: Provider[] = [
  { provide: PecaRepository, useClass: PrismaPecaRepository },
];

const useCaseProviders: Provider[] = [
  {
    provide: CriarPecaUseCase,
    useFactory: (repo: PecaRepository) => new CriarPecaUseCase(repo),
    inject: [PecaRepository],
  },
  {
    provide: ListarPecasUseCase,
    useFactory: (repo: PecaRepository) => new ListarPecasUseCase(repo),
    inject: [PecaRepository],
  },
  {
    provide: BuscarPecaPorIdUseCase,
    useFactory: (repo: PecaRepository) => new BuscarPecaPorIdUseCase(repo),
    inject: [PecaRepository],
  },
  {
    provide: AtualizarPecaUseCase,
    useFactory: (repo: PecaRepository) => new AtualizarPecaUseCase(repo),
    inject: [PecaRepository],
  },
  {
    provide: RemoverPecaUseCase,
    useFactory: (repo: PecaRepository) => new RemoverPecaUseCase(repo),
    inject: [PecaRepository],
  },
];

@Module({
  imports: [PrismaModule],
  controllers: [PecaController],
  providers: [...repositoryBindings, ...useCaseProviders],
  exports: [PecaRepository],
})
export class PecaModule {}
