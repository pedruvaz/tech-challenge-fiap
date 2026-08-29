import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoNaoEncontradoException } from '../../domain/exceptions/insumo-nao-encontrado.exception';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';
import { AtualizarInsumoUseCase } from './atualizar-insumo.use-case';

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

describe('AtualizarInsumoUseCase', () => {
  it('lança InsumoNaoEncontradoException quando não existe', async () => {
    const repo = criarRepo(null);

    await expect(
      new AtualizarInsumoUseCase(repo).executar({ insumoId: 99 }),
    ).rejects.toThrow(InsumoNaoEncontradoException);
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('aplica a alteração e devolve o resultado do repositório', async () => {
    const alvo = insumoPersistido();
    const repo = criarRepo(alvo);

    const resultado = await new AtualizarInsumoUseCase(repo).executar({
      insumoId: 42,
      ...{ qtdEstoque: 3 },
    });

    expect(alvo.qtdEstoque).toBe(3);
    expect(resultado).toBe(alvo);
    expect(repo.salvar).toHaveBeenCalledWith(alvo);
  });

  it('mantém os campos não informados', async () => {
    const alvo = insumoPersistido();
    const repo = criarRepo(alvo);

    await new AtualizarInsumoUseCase(repo).executar({ insumoId: 42 });

    expect(alvo.nome).toBe('Filtro de óleo');
  });
});
