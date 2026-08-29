import { Peca } from '../../domain/entities/peca.entity';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import {
  PecaNaoAssociadaException,
  PecaNaoEncontradaException,
} from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { PecaRepository } from '../../domain/repositories/peca.repository';
import { Dinheiro } from '../../domain/value-objects/dinheiro.vo';
import { AdicionarPecaNaOsUseCase } from './adicionar-peca-na-os.use-case';
import { RemoverPecaDaOsUseCase } from './remover-peca-da-os.use-case';
import { novaOs, OsRepoFake, UowFake } from './fakes.spec-helper';

const novaPeca = (qtdEstoque: number): Peca =>
  Peca.reconstituir({
    pecaId: 42,
    nome: 'Vela',
    qtdEstoque,
    valorUn: Dinheiro.deNumero(10),
  });

const pecaRepoCom = (peca: Peca | null) =>
  ({
    buscarPorId: jest.fn().mockResolvedValue(peca),
    salvar: jest.fn().mockResolvedValue(undefined),
  }) as unknown as PecaRepository & { salvar: jest.Mock };

describe('RemoverPecaDaOsUseCase', () => {
  it('lança OsNaoEncontradaException quando a OS não existe', async () => {
    const uc = new RemoverPecaDaOsUseCase(
      new OsRepoFake(null),
      pecaRepoCom(novaPeca(10)),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', pecaId: 42 }),
    ).rejects.toBeInstanceOf(OsNaoEncontradaException);
  });

  it('lança PecaNaoAssociadaException quando a peça não está na OS', async () => {
    const uc = new RemoverPecaDaOsUseCase(
      new OsRepoFake(novaOs()),
      pecaRepoCom(novaPeca(10)),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', pecaId: 42 }),
    ).rejects.toBeInstanceOf(PecaNaoAssociadaException);
  });

  it('lança PecaNaoEncontradaException se o catálogo perdeu a peça', async () => {
    const os = novaOs();
    await new AdicionarPecaNaOsUseCase(
      new OsRepoFake(os),
      pecaRepoCom(novaPeca(10)),
      new UowFake(),
    ).executar({ osId: 'os-1', pecaId: 42, qtd: 2 });

    const uc = new RemoverPecaDaOsUseCase(
      new OsRepoFake(os),
      pecaRepoCom(null),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', pecaId: 42 }),
    ).rejects.toBeInstanceOf(PecaNaoEncontradaException);
  });

  it('estorna o estoque e remove a linha da OS', async () => {
    const os = novaOs();
    const peca = novaPeca(10);
    await new AdicionarPecaNaOsUseCase(
      new OsRepoFake(os),
      pecaRepoCom(peca),
      new UowFake(),
    ).executar({ osId: 'os-1', pecaId: 42, qtd: 3 });
    expect(peca.qtdEstoque).toBe(7);

    const osRepo = new OsRepoFake(os);
    const pecaRepo = pecaRepoCom(peca);
    const uow = new UowFake();

    await new RemoverPecaDaOsUseCase(osRepo, pecaRepo, uow).executar({
      osId: 'os-1',
      pecaId: 42,
    });

    expect(peca.qtdEstoque).toBe(10);
    expect(os.quantidadeDePeca(42)).toBe(0);
    expect(uow.executou).toBe(true);
    expect(pecaRepo.salvar).toHaveBeenCalledWith(peca);
    expect(osRepo.salvar).toHaveBeenCalledWith(os);
  });
});
