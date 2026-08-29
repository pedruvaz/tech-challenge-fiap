import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';
import { ListarInsumosUseCase } from './listar-insumos.use-case';

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

describe('ListarInsumosUseCase', () => {
  it('delega a listagem ao repositório', async () => {
    const repo = criarRepo(insumoPersistido());

    const resultado = await new ListarInsumosUseCase(repo).executar();

    expect(resultado.map((x) => x.insumoId)).toEqual([42]);
    expect(repo.listar).toHaveBeenCalledTimes(1);
  });

  it('devolve lista vazia quando não há registros', async () => {
    await expect(
      new ListarInsumosUseCase(criarRepo(null)).executar(),
    ).resolves.toEqual([]);
  });
});
