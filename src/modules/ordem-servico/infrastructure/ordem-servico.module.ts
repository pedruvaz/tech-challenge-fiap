import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AdicionarInsumoNaOsUseCase } from '../application/use-cases/adicionar-insumo-na-os.use-case';
import { AdicionarPecaNaOsUseCase } from '../application/use-cases/adicionar-peca-na-os.use-case';
import { AdicionarServicoNaOsUseCase } from '../application/use-cases/adicionar-servico-na-os.use-case';
import { AprovarOrcamentoUseCase } from '../application/use-cases/aprovar-orcamento.use-case';
import { AvancarStatusOsUseCase } from '../application/use-cases/avancar-status-os.use-case';
import { BuscarOrdemServicoPorIdUseCase } from '../application/use-cases/buscar-ordem-servico-por-id.use-case';
import { CalcularTempoMedioExecucaoUseCase } from '../application/use-cases/calcular-tempo-medio-execucao.use-case';
import { ConsultarOrdemServicoPublicaUseCase } from '../application/use-cases/consultar-ordem-servico-publica.use-case';
import { CriarOrdemServicoUseCase } from '../application/use-cases/criar-ordem-servico.use-case';
import { ListarOrdensServicoUseCase } from '../application/use-cases/listar-ordens-servico.use-case';
import { RemoverInsumoDaOsUseCase } from '../application/use-cases/remover-insumo-da-os.use-case';
import { RemoverOrdemServicoUseCase } from '../application/use-cases/remover-ordem-servico.use-case';
import { RemoverPecaDaOsUseCase } from '../application/use-cases/remover-peca-da-os.use-case';
import { RemoverServicoDaOsUseCase } from '../application/use-cases/remover-servico-da-os.use-case';
import { ClienteRepository } from '../domain/repositories/cliente.repository';
import { InsumoRepository } from '../domain/repositories/insumo.repository';
import { MecanicoRepository } from '../domain/repositories/mecanico.repository';
import { OrdemServicoRepository } from '../domain/repositories/ordem-servico.repository';
import { OrdemServicoViewRepository } from '../domain/repositories/ordem-servico.view';
import { PecaRepository } from '../domain/repositories/peca.repository';
import { ServicoRepository } from '../domain/repositories/servico.repository';
import { UnitOfWork } from '../domain/repositories/unit-of-work';
import { VeiculoRepository } from '../domain/repositories/veiculo.repository';
import { OrdemServicoPublicoController } from './http/ordem-servico-publico.controller';
import { OrdemServicoController } from './http/ordem-servico.controller';
import { PrismaClienteRepository } from './persistence/prisma-cliente.repository';
import { PrismaInsumoRepository } from './persistence/prisma-insumo.repository';
import { PrismaMecanicoRepository } from './persistence/prisma-mecanico.repository';
import { PrismaOrdemServicoRepository } from './persistence/prisma-ordem-servico.repository';
import { PrismaOrdemServicoView } from './persistence/prisma-ordem-servico.view';
import { PrismaPecaRepository } from './persistence/prisma-peca.repository';
import { PrismaServicoRepository } from './persistence/prisma-servico.repository';
import { PrismaTransactionContext } from './persistence/prisma-transaction-context';
import { PrismaVeiculoRepository } from './persistence/prisma-veiculo.repository';

// Interfaces do domínio associadas às suas implementações Prisma.
const repositoryBindings: Provider[] = [
  PrismaTransactionContext,
  { provide: UnitOfWork, useExisting: PrismaTransactionContext },
  { provide: OrdemServicoRepository, useClass: PrismaOrdemServicoRepository },
  { provide: OrdemServicoViewRepository, useClass: PrismaOrdemServicoView },
  { provide: PecaRepository, useClass: PrismaPecaRepository },
  { provide: InsumoRepository, useClass: PrismaInsumoRepository },
  { provide: ServicoRepository, useClass: PrismaServicoRepository },
  { provide: ClienteRepository, useClass: PrismaClienteRepository },
  { provide: VeiculoRepository, useClass: PrismaVeiculoRepository },
  { provide: MecanicoRepository, useClass: PrismaMecanicoRepository },
];

// Cada use case é uma classe pura (sem @Injectable), então instanciamos
// explicitamente com factory. Isso mantém a camada de aplicação
// desacoplada do NestJS conforme a Arquitetura Limpa exige.
const useCaseProviders: Provider[] = [
  {
    provide: CriarOrdemServicoUseCase,
    useFactory: (
      os: OrdemServicoRepository,
      mecanico: MecanicoRepository,
      cliente: ClienteRepository,
      veiculo: VeiculoRepository,
      uow: UnitOfWork,
    ) => new CriarOrdemServicoUseCase(os, mecanico, cliente, veiculo, uow),
    inject: [
      OrdemServicoRepository,
      MecanicoRepository,
      ClienteRepository,
      VeiculoRepository,
      UnitOfWork,
    ],
  },
  {
    provide: ListarOrdensServicoUseCase,
    useFactory: (os: OrdemServicoRepository) => new ListarOrdensServicoUseCase(os),
    inject: [OrdemServicoRepository],
  },
  {
    provide: BuscarOrdemServicoPorIdUseCase,
    useFactory: (os: OrdemServicoRepository) => new BuscarOrdemServicoPorIdUseCase(os),
    inject: [OrdemServicoRepository],
  },
  {
    provide: ConsultarOrdemServicoPublicaUseCase,
    useFactory: (os: OrdemServicoRepository, cliente: ClienteRepository) =>
      new ConsultarOrdemServicoPublicaUseCase(os, cliente),
    inject: [OrdemServicoRepository, ClienteRepository],
  },
  {
    provide: AvancarStatusOsUseCase,
    useFactory: (os: OrdemServicoRepository, uow: UnitOfWork) =>
      new AvancarStatusOsUseCase(os, uow),
    inject: [OrdemServicoRepository, UnitOfWork],
  },
  {
    provide: AprovarOrcamentoUseCase,
    useFactory: (os: OrdemServicoRepository, uow: UnitOfWork) =>
      new AprovarOrcamentoUseCase(os, uow),
    inject: [OrdemServicoRepository, UnitOfWork],
  },
  {
    provide: RemoverOrdemServicoUseCase,
    useFactory: (os: OrdemServicoRepository, uow: UnitOfWork) =>
      new RemoverOrdemServicoUseCase(os, uow),
    inject: [OrdemServicoRepository, UnitOfWork],
  },
  {
    provide: AdicionarServicoNaOsUseCase,
    useFactory: (
      os: OrdemServicoRepository,
      servico: ServicoRepository,
      uow: UnitOfWork,
    ) => new AdicionarServicoNaOsUseCase(os, servico, uow),
    inject: [OrdemServicoRepository, ServicoRepository, UnitOfWork],
  },
  {
    provide: RemoverServicoDaOsUseCase,
    useFactory: (os: OrdemServicoRepository, uow: UnitOfWork) =>
      new RemoverServicoDaOsUseCase(os, uow),
    inject: [OrdemServicoRepository, UnitOfWork],
  },
  {
    provide: AdicionarPecaNaOsUseCase,
    useFactory: (
      os: OrdemServicoRepository,
      peca: PecaRepository,
      uow: UnitOfWork,
    ) => new AdicionarPecaNaOsUseCase(os, peca, uow),
    inject: [OrdemServicoRepository, PecaRepository, UnitOfWork],
  },
  {
    provide: RemoverPecaDaOsUseCase,
    useFactory: (
      os: OrdemServicoRepository,
      peca: PecaRepository,
      uow: UnitOfWork,
    ) => new RemoverPecaDaOsUseCase(os, peca, uow),
    inject: [OrdemServicoRepository, PecaRepository, UnitOfWork],
  },
  {
    provide: AdicionarInsumoNaOsUseCase,
    useFactory: (
      os: OrdemServicoRepository,
      insumo: InsumoRepository,
      uow: UnitOfWork,
    ) => new AdicionarInsumoNaOsUseCase(os, insumo, uow),
    inject: [OrdemServicoRepository, InsumoRepository, UnitOfWork],
  },
  {
    provide: RemoverInsumoDaOsUseCase,
    useFactory: (
      os: OrdemServicoRepository,
      insumo: InsumoRepository,
      uow: UnitOfWork,
    ) => new RemoverInsumoDaOsUseCase(os, insumo, uow),
    inject: [OrdemServicoRepository, InsumoRepository, UnitOfWork],
  },
  {
    provide: CalcularTempoMedioExecucaoUseCase,
    useFactory: (os: OrdemServicoRepository) =>
      new CalcularTempoMedioExecucaoUseCase(os),
    inject: [OrdemServicoRepository],
  },
];

@Module({
  imports: [PrismaModule],
  controllers: [OrdemServicoController, OrdemServicoPublicoController],
  providers: [...repositoryBindings, ...useCaseProviders],
})
export class OrdemServicoModule {}
