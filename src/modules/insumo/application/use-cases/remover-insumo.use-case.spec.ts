import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoNaoEncontradoException } from '../../domain/exceptions/insumo-nao-encontrado.exception';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';
import { RemoverInsumoUseCase } from './remover-insumo.use-case';

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

describe('RemoverInsumoUseCase', () => {
  it('faz soft delete e persiste', async () => {
    const alvo = insumoPersistido();
    const repo = criarRepo(alvo);

    await new RemoverInsumoUseCase(repo).executar(42);

    expect(alvo.deletadoEm).toBeInstanceOf(Date);
    expect(repo.salvar).toHaveBeenCalledWith(alvo);
  });

  it('lança InsumoNaoEncontradoException e não salva', async () => {
    const repo = criarRepo(null);

    await expect(new RemoverInsumoUseCase(repo).executar(99)).rejects.toThrow(
      InsumoNaoEncontradoException,
    );
    expect(repo.salvar).not.toHaveBeenCalled();
  });
});
