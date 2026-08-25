import { Peca } from '../../domain/entities/peca.entity';
import { PecaInvalidaException } from '../../domain/exceptions/peca-invalida.exception';
import { PecaRepository } from '../../domain/repositories/peca.repository';
import { CriarPecaUseCase } from './criar-peca.use-case';

class RepoFake implements PecaRepository {
  pecas: Peca[] = [];
  private nextId = 1;

  salvar = jest.fn((p: Peca): Promise<Peca> => {
    const reconstituida = Peca.reconstituir({
      pecaId: this.nextId++,
      nome: p.nome,
      qtdEstoque: p.qtdEstoque,
      valorUn: p.valorUn,
      criadoEm: p.criadoEm,
      atualizadoEm: p.atualizadoEm,
      deletadoEm: p.deletadoEm,
    });
    this.pecas.push(reconstituida);
    return Promise.resolve(reconstituida);
  });
  buscarPorId = jest.fn(
    (id: number): Promise<Peca | null> =>
      Promise.resolve(this.pecas.find((p) => p.pecaId === id) ?? null),
  );
  listar = jest.fn((): Promise<Peca[]> => Promise.resolve(this.pecas));
}

describe('CriarPecaUseCase', () => {
  it('cria peça válida', async () => {
    const repo = new RepoFake();
    const uc = new CriarPecaUseCase(repo);
    const peca = await uc.executar({
      nome: 'Motor',
      qtdEstoque: 10,
      valorUn: 49.9,
    });
    expect(peca.nome).toBe('Motor');
    expect(repo.salvar).toHaveBeenCalledTimes(1);
  });

  it('rejeita nome curto demais', async () => {
    const repo = new RepoFake();
    const uc = new CriarPecaUseCase(repo);
    await expect(
      uc.executar({ nome: 'A', qtdEstoque: 1, valorUn: 1 }),
    ).rejects.toBeInstanceOf(PecaInvalidaException);
  });

  it('rejeita valor negativo', async () => {
    const repo = new RepoFake();
    const uc = new CriarPecaUseCase(repo);
    await expect(
      uc.executar({ nome: 'Motor', qtdEstoque: 1, valorUn: -1 }),
    ).rejects.toBeInstanceOf(PecaInvalidaException);
  });
});
