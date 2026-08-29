import { Peca } from '../../domain/entities/peca.entity';
import { PecaRepository } from '../../domain/repositories/peca.repository';
import { ListarPecasUseCase } from './listar-pecas.use-case';

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

const criarRepo = (achado: Peca | null) =>
  ({
    salvar: jest.fn().mockImplementation((x: Peca) => Promise.resolve(x)),
    buscarPorId: jest.fn().mockResolvedValue(achado),
    listar: jest.fn().mockResolvedValue(achado ? [achado] : []),
  }) as unknown as PecaRepository;

describe('ListarPecasUseCase', () => {
  it('delega a listagem ao repositório', async () => {
    const repo = criarRepo(pecaPersistido());

    const resultado = await new ListarPecasUseCase(repo).executar();

    expect(resultado.map((x) => x.pecaId)).toEqual([42]);
    expect(repo.listar).toHaveBeenCalledTimes(1);
  });

  it('devolve lista vazia quando não há registros', async () => {
    await expect(
      new ListarPecasUseCase(criarRepo(null)).executar(),
    ).resolves.toEqual([]);
  });
});
