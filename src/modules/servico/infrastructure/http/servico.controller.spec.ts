import { AtualizarServicoUseCase } from '../../application/use-cases/atualizar-servico.use-case';
import { BuscarServicoPorIdUseCase } from '../../application/use-cases/buscar-servico-por-id.use-case';
import { CriarServicoUseCase } from '../../application/use-cases/criar-servico.use-case';
import { ListarServicosUseCase } from '../../application/use-cases/listar-servicos.use-case';
import { RemoverServicoUseCase } from '../../application/use-cases/remover-servico.use-case';
import { Servico } from '../../domain/entities/servico.entity';
import { ServicoNaoEncontradoException } from '../../domain/exceptions/servico-nao-encontrado.exception';
import { ServicoController } from './servico.controller';

const servicoPersistido = (servicoId = 42): Servico =>
  Servico.reconstituir({
    servicoId,
    descricao: 'Troca de óleo',
    valor: 120,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
  });

function montar() {
  const criar = { executar: jest.fn() };
  const listar = { executar: jest.fn() };
  const buscarPorId = { executar: jest.fn() };
  const atualizar = { executar: jest.fn() };
  const remover = { executar: jest.fn() };

  const controller = new ServicoController(
    criar as unknown as CriarServicoUseCase,
    listar as unknown as ListarServicosUseCase,
    buscarPorId as unknown as BuscarServicoPorIdUseCase,
    atualizar as unknown as AtualizarServicoUseCase,
    remover as unknown as RemoverServicoUseCase,
  );

  return { controller, criar, listar, buscarPorId, atualizar, remover };
}

describe('ServicoController', () => {
  it('POST /servicos repassa o body e devolve o DTO apresentado', async () => {
    const { controller, criar } = montar();
    criar.executar.mockResolvedValue(servicoPersistido());
    const body = { descricao: 'Troca de óleo', valor: 120 };

    const dto = await controller.criarServico(body);

    expect(criar.executar).toHaveBeenCalledWith(body);
    expect(dto.servicoId).toBe(42);
  });

  it('GET /servicos apresenta a lista devolvida pelo use-case', async () => {
    const { controller, listar } = montar();
    listar.executar.mockResolvedValue([
      servicoPersistido(42),
      servicoPersistido(43),
    ]);

    const dtos = await controller.listarServicos();

    expect(dtos.map((d) => d.servicoId)).toEqual([42, 43]);
  });

  it('GET /servicos devolve array vazio quando não há registros', async () => {
    const { controller, listar } = montar();
    listar.executar.mockResolvedValue([]);

    await expect(controller.listarServicos()).resolves.toEqual([]);
  });

  it('GET /servicos/:id busca pelo id da rota', async () => {
    const { controller, buscarPorId } = montar();
    buscarPorId.executar.mockResolvedValue(servicoPersistido());

    const dto = await controller.buscar(42);

    expect(buscarPorId.executar).toHaveBeenCalledWith(42);
    expect(dto.descricao).toBe('Troca de óleo');
  });

  it('GET /servicos/:id propaga ServicoNaoEncontradoException', async () => {
    const { controller, buscarPorId } = montar();
    buscarPorId.executar.mockRejectedValue(
      new ServicoNaoEncontradoException(99),
    );

    await expect(controller.buscar(99)).rejects.toThrow(
      ServicoNaoEncontradoException,
    );
  });

  it('PATCH /servicos/:id combina o id da rota com o body', async () => {
    const { controller, atualizar } = montar();
    atualizar.executar.mockResolvedValue(servicoPersistido());

    await controller.atualizarServico(42, { valor: 90 });

    expect(atualizar.executar).toHaveBeenCalledWith({
      servicoId: 42,
      ...{ valor: 90 },
    });
  });

  it('DELETE /servicos/:id delega a remoção e resolve sem corpo', async () => {
    const { controller, remover } = montar();
    remover.executar.mockResolvedValue(undefined);

    await expect(controller.removerServico(42)).resolves.toBeUndefined();
    expect(remover.executar).toHaveBeenCalledWith(42);
  });

  it('DELETE /servicos/:id propaga erro quando não existe', async () => {
    const { controller, remover } = montar();
    remover.executar.mockRejectedValue(new ServicoNaoEncontradoException(99));

    await expect(controller.removerServico(99)).rejects.toThrow(
      ServicoNaoEncontradoException,
    );
  });
});
