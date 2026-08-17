import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AtualizarInsumoUseCase } from '../application/use-cases/atualizar-insumo.use-case';
import { BuscarInsumoPorIdUseCase } from '../application/use-cases/buscar-insumo-por-id.use-case';
import { CriarInsumoUseCase } from '../application/use-cases/criar-insumo.use-case';
import { ListarInsumosUseCase } from '../application/use-cases/listar-insumos.use-case';
import { RemoverInsumoUseCase } from '../application/use-cases/remover-insumo.use-case';
import { InsumoRepository } from '../domain/repositories/insumo.repository';
import { InsumoController } from './http/insumo.controller';
import { PrismaInsumoRepository } from './persistence/prisma-insumo.repository';

const repositoryBindings: Provider[] = [
  { provide: InsumoRepository, useClass: PrismaInsumoRepository },
];

const useCaseProviders: Provider[] = [
  {
    provide: CriarInsumoUseCase,
    useFactory: (repo: InsumoRepository) => new CriarInsumoUseCase(repo),
    inject: [InsumoRepository],
  },
  {
    provide: ListarInsumosUseCase,
    useFactory: (repo: InsumoRepository) => new ListarInsumosUseCase(repo),
    inject: [InsumoRepository],
  },
  {
    provide: BuscarInsumoPorIdUseCase,
    useFactory: (repo: InsumoRepository) => new BuscarInsumoPorIdUseCase(repo),
    inject: [InsumoRepository],
  },
  {
    provide: AtualizarInsumoUseCase,
    useFactory: (repo: InsumoRepository) => new AtualizarInsumoUseCase(repo),
    inject: [InsumoRepository],
  },
  {
    provide: RemoverInsumoUseCase,
    useFactory: (repo: InsumoRepository) => new RemoverInsumoUseCase(repo),
    inject: [InsumoRepository],
  },
];

@Module({
  imports: [PrismaModule],
  controllers: [InsumoController],
  providers: [...repositoryBindings, ...useCaseProviders],
  exports: [InsumoRepository],
})
export class InsumoModule {}
