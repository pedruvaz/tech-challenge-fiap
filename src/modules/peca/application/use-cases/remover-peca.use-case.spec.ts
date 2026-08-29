import { Peca } from '../../domain/entities/peca.entity';
import { PecaNaoEncontradaException } from '../../domain/exceptions/peca-nao-encontrada.exception';
import { PecaRepository } from '../../domain/repositories/peca.repository';
import { RemoverPecaUseCase } from './remover-peca.use-case';

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

describe('RemoverPecaUseCase', () => {
  it('faz soft delete e persiste', async () => {
    const alvo = pecaPersistido();
    const repo = criarRepo(alvo);

    await new RemoverPecaUseCase(repo).executar(42);

    expect(alvo.deletadoEm).toBeInstanceOf(Date);
    expect(repo.salvar).toHaveBeenCalledWith(alvo);
  });

  it('lança PecaNaoEncontradaException e não salva', async () => {
    const repo = criarRepo(null);

    await expect(new RemoverPecaUseCase(repo).executar(99)).rejects.toThrow(
      PecaNaoEncontradaException,
    );
    expect(repo.salvar).not.toHaveBeenCalled();
  });
});
