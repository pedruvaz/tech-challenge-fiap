import { Peca } from '../../domain/entities/peca.entity';
import { PecaNaoEncontradaException } from '../../domain/exceptions/peca-nao-encontrada.exception';
import { PecaRepository } from '../../domain/repositories/peca.repository';
import { AtualizarPecaUseCase } from './atualizar-peca.use-case';

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

describe('AtualizarPecaUseCase', () => {
  it('lança PecaNaoEncontradaException quando não existe', async () => {
    const repo = criarRepo(null);

    await expect(
      new AtualizarPecaUseCase(repo).executar({ pecaId: 99 }),
    ).rejects.toThrow(PecaNaoEncontradaException);
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('aplica a alteração e devolve o resultado do repositório', async () => {
    const alvo = pecaPersistido();
    const repo = criarRepo(alvo);

    const resultado = await new AtualizarPecaUseCase(repo).executar({
      pecaId: 42,
      ...{ qtdEstoque: 3 },
    });

    expect(alvo.qtdEstoque).toBe(3);
    expect(resultado).toBe(alvo);
    expect(repo.salvar).toHaveBeenCalledWith(alvo);
  });

  it('mantém os campos não informados', async () => {
    const alvo = pecaPersistido();
    const repo = criarRepo(alvo);

    await new AtualizarPecaUseCase(repo).executar({ pecaId: 42 });

    expect(alvo.nome).toBe('Filtro de óleo');
  });
});
