import { AtualizarPecaUseCase } from '../../application/use-cases/atualizar-peca.use-case';
import { BuscarPecaPorIdUseCase } from '../../application/use-cases/buscar-peca-por-id.use-case';
import { CriarPecaUseCase } from '../../application/use-cases/criar-peca.use-case';
import { ListarPecasUseCase } from '../../application/use-cases/listar-pecas.use-case';
import { RemoverPecaUseCase } from '../../application/use-cases/remover-peca.use-case';
import { Peca } from '../../domain/entities/peca.entity';
import { PecaNaoEncontradaException } from '../../domain/exceptions/peca-nao-encontrada.exception';
import { PecaController } from './peca.controller';

const pecaPersistido = (pecaId = 42): Peca =>
  Peca.reconstituir({
    pecaId,
    nome: 'Filtro de óleo',
    qtdEstoque: 10,
    valorUn: 39.9,
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

  const controller = new PecaController(
    criar as unknown as CriarPecaUseCase,
    listar as unknown as ListarPecasUseCase,
    buscarPorId as unknown as BuscarPecaPorIdUseCase,
    atualizar as unknown as AtualizarPecaUseCase,
    remover as unknown as RemoverPecaUseCase,
  );

  return { controller, criar, listar, buscarPorId, atualizar, remover };
}

describe('PecaController', () => {
  it('POST /pecas repassa o body e devolve o DTO apresentado', async () => {
    const { controller, criar } = montar();
    criar.executar.mockResolvedValue(pecaPersistido());
    const body = { nome: 'Filtro de óleo', qtdEstoque: 10, valorUn: 39.9 };

    const dto = await controller.criarPeca(body);

    expect(criar.executar).toHaveBeenCalledWith(body);
    expect(dto.pecaId).toBe(42);
  });

  it('GET /pecas apresenta a lista devolvida pelo use-case', async () => {
    const { controller, listar } = montar();
    listar.executar.mockResolvedValue([pecaPersistido(42), pecaPersistido(43)]);

    const dtos = await controller.listarPecas();

    expect(dtos.map((d) => d.pecaId)).toEqual([42, 43]);
  });

  it('GET /pecas devolve array vazio quando não há registros', async () => {
    const { controller, listar } = montar();
    listar.executar.mockResolvedValue([]);

    await expect(controller.listarPecas()).resolves.toEqual([]);
  });

  it('GET /pecas/:id busca pelo id da rota', async () => {
    const { controller, buscarPorId } = montar();
    buscarPorId.executar.mockResolvedValue(pecaPersistido());

    const dto = await controller.buscar(42);

    expect(buscarPorId.executar).toHaveBeenCalledWith(42);
    expect(dto.nome).toBe('Filtro de óleo');
  });

  it('GET /pecas/:id propaga PecaNaoEncontradaException', async () => {
    const { controller, buscarPorId } = montar();
    buscarPorId.executar.mockRejectedValue(new PecaNaoEncontradaException(99));

    await expect(controller.buscar(99)).rejects.toThrow(
      PecaNaoEncontradaException,
    );
  });

  it('PATCH /pecas/:id combina o id da rota com o body', async () => {
    const { controller, atualizar } = montar();
    atualizar.executar.mockResolvedValue(pecaPersistido());

    await controller.atualizarPeca(42, { qtdEstoque: 3 });

    expect(atualizar.executar).toHaveBeenCalledWith({
      pecaId: 42,
      ...{ qtdEstoque: 3 },
    });
  });

  it('DELETE /pecas/:id delega a remoção e resolve sem corpo', async () => {
    const { controller, remover } = montar();
    remover.executar.mockResolvedValue(undefined);

    await expect(controller.removerPeca(42)).resolves.toBeUndefined();
    expect(remover.executar).toHaveBeenCalledWith(42);
  });

  it('DELETE /pecas/:id propaga erro quando não existe', async () => {
    const { controller, remover } = montar();
    remover.executar.mockRejectedValue(new PecaNaoEncontradaException(99));

    await expect(controller.removerPeca(99)).rejects.toThrow(
      PecaNaoEncontradaException,
    );
  });
});
