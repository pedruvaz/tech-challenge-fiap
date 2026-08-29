import { Peca } from '../../domain/entities/peca.entity';
import { PecaNaoEncontradaException } from '../../domain/exceptions/peca-nao-encontrada.exception';
import { PecaRepository } from '../../domain/repositories/peca.repository';
import { BuscarPecaPorIdUseCase } from './buscar-peca-por-id.use-case';

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

describe('BuscarPecaPorIdUseCase', () => {
  it('devolve o registro encontrado', async () => {
    const alvo = pecaPersistido();
    const repo = criarRepo(alvo);

    await expect(new BuscarPecaPorIdUseCase(repo).executar(42)).resolves.toBe(
      alvo,
    );
    expect(repo.buscarPorId).toHaveBeenCalledWith(42);
  });

  it('lança PecaNaoEncontradaException quando não existe', async () => {
    await expect(
      new BuscarPecaPorIdUseCase(criarRepo(null)).executar(99),
    ).rejects.toThrow(PecaNaoEncontradaException);
  });
});
