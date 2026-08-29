import { Status } from '@prisma/client';
import { AdicionarInsumoNaOsUseCase } from '../../application/use-cases/adicionar-insumo-na-os.use-case';
import { AdicionarPecaNaOsUseCase } from '../../application/use-cases/adicionar-peca-na-os.use-case';
import { AdicionarServicoNaOsUseCase } from '../../application/use-cases/adicionar-servico-na-os.use-case';
import { AprovarOrcamentoUseCase } from '../../application/use-cases/aprovar-orcamento.use-case';
import { AvancarStatusOsUseCase } from '../../application/use-cases/avancar-status-os.use-case';
import { BuscarOrdemServicoPorIdUseCase } from '../../application/use-cases/buscar-ordem-servico-por-id.use-case';
import { CalcularTempoMedioExecucaoUseCase } from '../../application/use-cases/calcular-tempo-medio-execucao.use-case';
import { CriarOrdemServicoUseCase } from '../../application/use-cases/criar-ordem-servico.use-case';
import { ListarOrdensServicoUseCase } from '../../application/use-cases/listar-ordens-servico.use-case';
import { RemoverInsumoDaOsUseCase } from '../../application/use-cases/remover-insumo-da-os.use-case';
import { RemoverOrdemServicoUseCase } from '../../application/use-cases/remover-ordem-servico.use-case';
import { RemoverPecaDaOsUseCase } from '../../application/use-cases/remover-peca-da-os.use-case';
import { RemoverServicoDaOsUseCase } from '../../application/use-cases/remover-servico-da-os.use-case';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { OrdemServicoView } from '../../domain/repositories/ordem-servico.view';
import { OrdemServicoController } from './ordem-servico.controller';

const OS_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';

const view = (over: Partial<OrdemServicoView> = {}): OrdemServicoView => ({
  osId: OS_ID,
  usuarioId: 1,
  clienteId: 'c1',
  veiculoId: 'v1',
  status: 'recebida',
  valorFinal: 0,
  criadoEm: new Date('2024-01-01T00:00:00Z'),
  atualizadoEm: new Date('2024-02-01T00:00:00Z'),
  deletadoEm: null,
  mecanico: null,
  cliente: null,
  veiculo: null,
  servicosRealizados: [],
  pecasUtilizadas: [],
  insumosConsumidos: [],
  ...over,
});

function montar() {
  const uc = () => ({ executar: jest.fn().mockResolvedValue(undefined) });
  const criar = uc();
  const listar = uc();
  const buscarPorId = uc();
  const avancarStatus = uc();
  const aprovarOrcamento = uc();
  const remover = uc();
  const adicionarServico = uc();
  const removerServico = uc();
  const adicionarPeca = uc();
  const removerPeca = uc();
  const adicionarInsumo = uc();
  const removerInsumo = uc();
  const calcularTempoMedio = uc();

  const viewRepo = {
    buscarPorId: jest.fn().mockResolvedValue(view()),
    listar: jest.fn().mockResolvedValue([]),
  };

  const controller = new OrdemServicoController(
    criar as unknown as CriarOrdemServicoUseCase,
    listar as unknown as ListarOrdensServicoUseCase,
    buscarPorId as unknown as BuscarOrdemServicoPorIdUseCase,
    avancarStatus as unknown as AvancarStatusOsUseCase,
    aprovarOrcamento as unknown as AprovarOrcamentoUseCase,
    remover as unknown as RemoverOrdemServicoUseCase,
    adicionarServico as unknown as AdicionarServicoNaOsUseCase,
    removerServico as unknown as RemoverServicoDaOsUseCase,
    adicionarPeca as unknown as AdicionarPecaNaOsUseCase,
    removerPeca as unknown as RemoverPecaDaOsUseCase,
    adicionarInsumo as unknown as AdicionarInsumoNaOsUseCase,
    removerInsumo as unknown as RemoverInsumoDaOsUseCase,
    calcularTempoMedio as unknown as CalcularTempoMedioExecucaoUseCase,
    viewRepo,
  );

  return {
    controller,
    criar,
    listar,
    buscarPorId,
    avancarStatus,
    aprovarOrcamento,
    remover,
    adicionarServico,
    removerServico,
    adicionarPeca,
    removerPeca,
    adicionarInsumo,
    removerInsumo,
    calcularTempoMedio,
    viewRepo,
  };
}

describe('OrdemServicoController', () => {
  describe('POST /ordens-servico', () => {
    it('cria a OS e devolve a projeção recém-lida', async () => {
      const { controller, criar, viewRepo } = montar();
      criar.executar.mockResolvedValue({ osId: OS_ID });
      const body = { mecanicoId: 1, clienteId: 'c1', veiculoId: 'v1' };

      const dto = await controller.criarOs(body);

      expect(criar.executar).toHaveBeenCalledWith(body);
      expect(viewRepo.buscarPorId).toHaveBeenCalledWith(OS_ID);
      expect(dto.osId).toBe(OS_ID);
    });
  });

  describe('GET /ordens-servico', () => {
    it('lê da view sem filtros quando nenhum query param é enviado', async () => {
      const { controller, viewRepo } = montar();
      viewRepo.listar.mockResolvedValue([view()]);

      const dtos = await controller.listarOs();

      expect(viewRepo.listar).toHaveBeenCalledWith({
        status: undefined,
        clienteId: undefined,
      });
      expect(dtos).toHaveLength(1);
    });

    it('repassa os filtros de status e cliente para a view', async () => {
      const { controller, viewRepo } = montar();
      viewRepo.listar.mockResolvedValue([]);

      await controller.listarOs(Status.em_execucao, 'c1');

      expect(viewRepo.listar).toHaveBeenCalledWith({
        status: Status.em_execucao,
        clienteId: 'c1',
      });
    });
  });

  describe('GET /ordens-servico/metricas/tempo-medio', () => {
    it('delega o cálculo ao use-case de métrica', async () => {
      const { controller, calcularTempoMedio } = montar();
      const metrica = {
        tempoMedioMs: 3_600_000,
        tempoMedioMinutos: 60,
        tempoMedioHoras: 1,
      };
      calcularTempoMedio.executar.mockResolvedValue(metrica);

      await expect(controller.tempoMedio()).resolves.toEqual(metrica);
    });
  });

  describe('GET /ordens-servico/:id', () => {
    it('valida a existência pelo use-case antes de projetar', async () => {
      const { controller, buscarPorId, viewRepo } = montar();

      const dto = await controller.buscarPorIdOs(OS_ID);

      expect(buscarPorId.executar).toHaveBeenCalledWith(OS_ID);
      expect(viewRepo.buscarPorId).toHaveBeenCalledWith(OS_ID);
      expect(dto.osId).toBe(OS_ID);
    });

    it('lança OsNaoEncontradaException quando a view não devolve nada', async () => {
      const { controller, viewRepo } = montar();
      viewRepo.buscarPorId.mockResolvedValue(null);

      await expect(controller.buscarPorIdOs(OS_ID)).rejects.toThrow(
        OsNaoEncontradaException,
      );
    });
  });

  describe('PATCH /ordens-servico/:id/status', () => {
    it('repassa id, novo status e usuário autenticado', async () => {
      const { controller, avancarStatus } = montar();

      await controller.atualizarStatus(
        OS_ID,
        { status: Status.em_execucao },
        3,
      );

      expect(avancarStatus.executar).toHaveBeenCalledWith({
        osId: OS_ID,
        novoStatus: Status.em_execucao,
        usuarioId: 3,
      });
    });

    it('aceita requisição sem usuário autenticado', async () => {
      const { controller, avancarStatus } = montar();

      await controller.atualizarStatus(OS_ID, { status: Status.finalizada });

      expect(avancarStatus.executar).toHaveBeenCalledWith({
        osId: OS_ID,
        novoStatus: Status.finalizada,
        usuarioId: undefined,
      });
    });
  });

  describe('POST /ordens-servico/:id/aprovar-orcamento', () => {
    it('repassa id e usuário autenticado', async () => {
      const { controller, aprovarOrcamento } = montar();

      const dto = await controller.aprovar(OS_ID, 3);

      expect(aprovarOrcamento.executar).toHaveBeenCalledWith({
        osId: OS_ID,
        usuarioId: 3,
      });
      expect(dto.osId).toBe(OS_ID);
    });
  });

  describe('DELETE /ordens-servico/:id', () => {
    it('delega a remoção e resolve sem corpo', async () => {
      const { controller, remover } = montar();

      await expect(controller.removerOs(OS_ID)).resolves.toBeUndefined();
      expect(remover.executar).toHaveBeenCalledWith(OS_ID);
    });
  });

  describe('linhas de serviço', () => {
    it('POST /:id/servicos repassa servicoId e quantidade', async () => {
      const { controller, adicionarServico } = montar();

      await controller.addServico(OS_ID, { servicoId: 1, quantidade: 2 });

      expect(adicionarServico.executar).toHaveBeenCalledWith({
        osId: OS_ID,
        servicoId: 1,
        quantidade: 2,
      });
    });

    it('DELETE /:id/servicos/:servicoId repassa os dois ids', async () => {
      const { controller, removerServico } = montar();

      await controller.delServico(OS_ID, 1);

      expect(removerServico.executar).toHaveBeenCalledWith({
        osId: OS_ID,
        servicoId: 1,
      });
    });
  });

  describe('linhas de peça', () => {
    it('POST /:id/pecas repassa pecaId e qtd', async () => {
      const { controller, adicionarPeca } = montar();

      await controller.addPeca(OS_ID, { pecaId: 2, qtd: 3 });

      expect(adicionarPeca.executar).toHaveBeenCalledWith({
        osId: OS_ID,
        pecaId: 2,
        qtd: 3,
      });
    });

    it('DELETE /:id/pecas/:pecaId repassa os dois ids', async () => {
      const { controller, removerPeca } = montar();

      await controller.delPeca(OS_ID, 2);

      expect(removerPeca.executar).toHaveBeenCalledWith({
        osId: OS_ID,
        pecaId: 2,
      });
    });
  });

  describe('linhas de insumo', () => {
    it('POST /:id/insumos repassa insumoId e qtdConsumida', async () => {
      const { controller, adicionarInsumo } = montar();

      await controller.addInsumo(OS_ID, { insumoId: 3, qtdConsumida: 4 });

      expect(adicionarInsumo.executar).toHaveBeenCalledWith({
        osId: OS_ID,
        insumoId: 3,
        qtdConsumida: 4,
      });
    });

    it('DELETE /:id/insumos/:insumoId repassa os dois ids', async () => {
      const { controller, removerInsumo } = montar();

      await controller.delInsumo(OS_ID, 3);

      expect(removerInsumo.executar).toHaveBeenCalledWith({
        osId: OS_ID,
        insumoId: 3,
      });
    });
  });

  it('toda rota que reprojeta a OS falha com OsNaoEncontradaException se a view sumir', async () => {
    const { controller, viewRepo } = montar();
    viewRepo.buscarPorId.mockResolvedValue(null);

    await expect(controller.aprovar(OS_ID, 3)).rejects.toThrow(
      OsNaoEncontradaException,
    );
    await expect(
      controller.addPeca(OS_ID, { pecaId: 2, qtd: 1 }),
    ).rejects.toThrow(OsNaoEncontradaException);
  });
});
