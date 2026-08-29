import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoNaoEncontradoException } from '../../domain/exceptions/insumo-nao-encontrado.exception';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';
import { BuscarInsumoPorIdUseCase } from './buscar-insumo-por-id.use-case';

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

const criarRepo = (achado: Insumo | null) =>
  ({
    salvar: jest.fn().mockImplementation((x: Insumo) => Promise.resolve(x)),
    buscarPorId: jest.fn().mockResolvedValue(achado),
    listar: jest.fn().mockResolvedValue(achado ? [achado] : []),
  }) as unknown as InsumoRepository;

describe('BuscarInsumoPorIdUseCase', () => {
  it('devolve o registro encontrado', async () => {
    const alvo = insumoPersistido();
    const repo = criarRepo(alvo);

    await expect(new BuscarInsumoPorIdUseCase(repo).executar(42)).resolves.toBe(
      alvo,
    );
    expect(repo.buscarPorId).toHaveBeenCalledWith(42);
  });

  it('lança InsumoNaoEncontradoException quando não existe', async () => {
    await expect(
      new BuscarInsumoPorIdUseCase(criarRepo(null)).executar(99),
    ).rejects.toThrow(InsumoNaoEncontradoException);
  });
});
