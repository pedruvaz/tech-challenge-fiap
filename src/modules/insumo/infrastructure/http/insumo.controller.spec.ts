import { AtualizarInsumoUseCase } from '../../application/use-cases/atualizar-insumo.use-case';
import { BuscarInsumoPorIdUseCase } from '../../application/use-cases/buscar-insumo-por-id.use-case';
import { CriarInsumoUseCase } from '../../application/use-cases/criar-insumo.use-case';
import { ListarInsumosUseCase } from '../../application/use-cases/listar-insumos.use-case';
import { RemoverInsumoUseCase } from '../../application/use-cases/remover-insumo.use-case';
import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoNaoEncontradoException } from '../../domain/exceptions/insumo-nao-encontrado.exception';
import { InsumoController } from './insumo.controller';

const insumoPersistido = (insumoId = 42): Insumo =>
  Insumo.reconstituir({
    insumoId,
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

  const controller = new InsumoController(
    criar as unknown as CriarInsumoUseCase,
    listar as unknown as ListarInsumosUseCase,
    buscarPorId as unknown as BuscarInsumoPorIdUseCase,
    atualizar as unknown as AtualizarInsumoUseCase,
    remover as unknown as RemoverInsumoUseCase,
  );

  return { controller, criar, listar, buscarPorId, atualizar, remover };
}

describe('InsumoController', () => {
  it('POST /insumos repassa o body e devolve o DTO apresentado', async () => {
    const { controller, criar } = montar();
    criar.executar.mockResolvedValue(insumoPersistido());
    const body = { nome: 'Filtro de óleo', qtdEstoque: 10, valorUn: 39.9 };

    const dto = await controller.criarInsumo(body);

    expect(criar.executar).toHaveBeenCalledWith(body);
    expect(dto.insumoId).toBe(42);
  });

  it('GET /insumos apresenta a lista devolvida pelo use-case', async () => {
    const { controller, listar } = montar();
    listar.executar.mockResolvedValue([
      insumoPersistido(42),
      insumoPersistido(43),
    ]);

    const dtos = await controller.listarInsumos();

    expect(dtos.map((d) => d.insumoId)).toEqual([42, 43]);
  });

  it('GET /insumos devolve array vazio quando não há registros', async () => {
    const { controller, listar } = montar();
    listar.executar.mockResolvedValue([]);

    await expect(controller.listarInsumos()).resolves.toEqual([]);
  });

  it('GET /insumos/:id busca pelo id da rota', async () => {
    const { controller, buscarPorId } = montar();
    buscarPorId.executar.mockResolvedValue(insumoPersistido());

    const dto = await controller.buscar(42);

    expect(buscarPorId.executar).toHaveBeenCalledWith(42);
    expect(dto.nome).toBe('Filtro de óleo');
  });

  it('GET /insumos/:id propaga InsumoNaoEncontradoException', async () => {
    const { controller, buscarPorId } = montar();
    buscarPorId.executar.mockRejectedValue(
      new InsumoNaoEncontradoException(99),
    );

    await expect(controller.buscar(99)).rejects.toThrow(
      InsumoNaoEncontradoException,
    );
  });

  it('PATCH /insumos/:id combina o id da rota com o body', async () => {
    const { controller, atualizar } = montar();
    atualizar.executar.mockResolvedValue(insumoPersistido());

    await controller.atualizarInsumo(42, { qtdEstoque: 3 });

    expect(atualizar.executar).toHaveBeenCalledWith({
      insumoId: 42,
      ...{ qtdEstoque: 3 },
    });
  });

  it('DELETE /insumos/:id delega a remoção e resolve sem corpo', async () => {
    const { controller, remover } = montar();
    remover.executar.mockResolvedValue(undefined);

    await expect(controller.removerInsumo(42)).resolves.toBeUndefined();
    expect(remover.executar).toHaveBeenCalledWith(42);
  });

  it('DELETE /insumos/:id propaga erro quando não existe', async () => {
    const { controller, remover } = montar();
    remover.executar.mockRejectedValue(new InsumoNaoEncontradoException(99));

    await expect(controller.removerInsumo(99)).rejects.toThrow(
      InsumoNaoEncontradoException,
    );
  });
});
