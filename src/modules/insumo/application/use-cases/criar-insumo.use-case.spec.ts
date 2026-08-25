import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoInvalidoException } from '../../domain/exceptions/insumo-invalido.exception';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';
import { CriarInsumoUseCase } from './criar-insumo.use-case';

class RepoFake implements InsumoRepository {
  insumos: Insumo[] = [];
  private nextId = 1;

  salvar = jest.fn((i: Insumo): Promise<Insumo> => {
    const reconstituido = Insumo.reconstituir({
      insumoId: this.nextId++,
      nome: i.nome,
      qtdEstoque: i.qtdEstoque,
      valorUn: i.valorUn,
      criadoEm: i.criadoEm,
      atualizadoEm: i.atualizadoEm,
      deletadoEm: i.deletadoEm,
    });
    this.insumos.push(reconstituido);
    return Promise.resolve(reconstituido);
  });
  buscarPorId = jest.fn(
    (id: number): Promise<Insumo | null> =>
      Promise.resolve(this.insumos.find((i) => i.insumoId === id) ?? null),
  );
  listar = jest.fn((): Promise<Insumo[]> => Promise.resolve(this.insumos));
}

describe('CriarInsumoUseCase', () => {
  it('cria insumo válido', async () => {
    const repo = new RepoFake();
    const uc = new CriarInsumoUseCase(repo);
    const insumo = await uc.executar({
      nome: 'Óleo de motor',
      qtdEstoque: 10,
      valorUn: 49.9,
    });
    expect(insumo.nome).toBe('Óleo de motor');
    expect(repo.salvar).toHaveBeenCalledTimes(1);
  });

  it('rejeita nome curto demais', async () => {
    const repo = new RepoFake();
    const uc = new CriarInsumoUseCase(repo);
    await expect(
      uc.executar({ nome: 'A', qtdEstoque: 1, valorUn: 1 }),
    ).rejects.toBeInstanceOf(InsumoInvalidoException);
  });

  it('rejeita quantidade negativa', async () => {
    const repo = new RepoFake();
    const uc = new CriarInsumoUseCase(repo);
    await expect(
      uc.executar({ nome: 'Óleo', qtdEstoque: -1, valorUn: 1 }),
    ).rejects.toBeInstanceOf(InsumoInvalidoException);
  });
});
