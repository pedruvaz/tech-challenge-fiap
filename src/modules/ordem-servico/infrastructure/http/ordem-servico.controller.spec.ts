import { ForbiddenException } from '@nestjs/common';
import { Status } from '@prisma/client';
import type { Request } from 'express';
import type { ReqUser } from '../../../../auth/types/req-user';
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
const CLIENTE_ID = 'c1111111-0000-0000-0000-000000000001';
const OUTRO_CLIENTE_ID = 'c9999999-0000-0000-0000-000000000099';

const view = (over: Partial<OrdemServicoView> = {}): OrdemServicoView => ({
  osId: OS_ID,
  usuarioId: 1,
  clienteId: CLIENTE_ID,
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

const reqFuncionario = (usuarioId = 1): Request =>
  ({
    user: {
      tipo: 'FUNCIONARIO',
      usuarioId,
      email: 'func@email.com',
      roles: 'admin',
    },
  }) as Request;

const reqCliente = (clienteId = CLIENTE_ID): Request =>
  ({
    user: { tipo: 'CLIENTE', clienteId, nome: 'João' },
  }) as Request;

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
    it('funcionário sem filtros: repassa undefined', async () => {
      const { controller, viewRepo } = montar();
      viewRepo.listar.mockResolvedValue([view()]);

      const dtos = await controller.listarOs(
        reqFuncionario(),
        undefined,
        undefined,
      );

      expect(viewRepo.listar).toHaveBeenCalledWith({
        status: undefined,
        clienteId: undefined,
      });
      expect(dtos).toHaveLength(1);
    });

    it('funcionário com filtros: repassa status e clienteId da query', async () => {
      const { controller, viewRepo } = montar();
      await controller.listarOs(reqFuncionario(), Status.em_execucao, 'c1');
      expect(viewRepo.listar).toHaveBeenCalledWith({
        status: Status.em_execucao,
        clienteId: 'c1',
      });
    });

    it('cliente: força clienteId do token, ignora query', async () => {
      const { controller, viewRepo } = montar();
      await controller.listarOs(
        reqCliente(CLIENTE_ID),
        undefined,
        OUTRO_CLIENTE_ID,
      );
      expect(viewRepo.listar).toHaveBeenCalledWith({
        status: undefined,
        clienteId: CLIENTE_ID,
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
    it('funcionário: lê OS sem restrição de posse', async () => {
      const { controller, buscarPorId } = montar();
      const dto = await controller.buscarPorIdOs(OS_ID, reqFuncionario());
      expect(buscarPorId.executar).toHaveBeenCalledWith(OS_ID);
      expect(dto.osId).toBe(OS_ID);
    });

    it('cliente lê a própria OS (clienteId do token == da OS)', async () => {
      const { controller } = montar();
      const dto = await controller.buscarPorIdOs(OS_ID, reqCliente(CLIENTE_ID));
      expect(dto.osId).toBe(OS_ID);
    });

    it('cliente tenta ler OS de outro cliente → ForbiddenException', async () => {
      const { controller } = montar();
      await expect(
        controller.buscarPorIdOs(OS_ID, reqCliente(OUTRO_CLIENTE_ID)),
      ).rejects.toThrow(ForbiddenException);
    });

    it('lança OsNaoEncontradaException quando a view não devolve nada', async () => {
      const { controller, viewRepo } = montar();
      viewRepo.buscarPorId.mockResolvedValue(null);
      await expect(
        controller.buscarPorIdOs(OS_ID, reqFuncionario()),
      ).rejects.toThrow(OsNaoEncontradaException);
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
    it('funcionário aprova: repassa usuarioId', async () => {
      const { controller, aprovarOrcamento } = montar();
      const dto = await controller.aprovar(OS_ID, reqFuncionario(3), 3);
      expect(aprovarOrcamento.executar).toHaveBeenCalledWith({
        osId: OS_ID,
        usuarioId: 3,
      });
      expect(dto.osId).toBe(OS_ID);
    });

    it('cliente aprova a própria OS (clienteId do token == da OS)', async () => {
      const { controller, aprovarOrcamento } = montar();
      await controller.aprovar(OS_ID, reqCliente(CLIENTE_ID), undefined);
      expect(aprovarOrcamento.executar).toHaveBeenCalledWith({
        osId: OS_ID,
        usuarioId: undefined,
      });
    });

    it('cliente tenta aprovar OS de outro cliente → ForbiddenException', async () => {
      const { controller } = montar();
      await expect(
        controller.aprovar(OS_ID, reqCliente(OUTRO_CLIENTE_ID), undefined),
      ).rejects.toThrow(ForbiddenException);
    });

    it('cliente com OS não encontrada → OsNaoEncontradaException', async () => {
      const { controller, viewRepo } = montar();
      viewRepo.buscarPorId.mockResolvedValue(null);
      await expect(
        controller.aprovar(OS_ID, reqCliente(CLIENTE_ID), undefined),
      ).rejects.toThrow(OsNaoEncontradaException);
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

    await expect(
      controller.aprovar(OS_ID, reqFuncionario(), 3),
    ).rejects.toThrow(OsNaoEncontradaException);
    await expect(
      controller.addPeca(OS_ID, { pecaId: 2, qtd: 1 }),
    ).rejects.toThrow(OsNaoEncontradaException);
  });
});
