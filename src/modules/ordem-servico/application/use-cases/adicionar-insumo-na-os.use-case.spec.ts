import { EstoqueInsuficienteException } from '../../domain/exceptions/estoque-insuficiente.exception';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { InsumoNaoEncontradoException } from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { AdicionarInsumoNaOsUseCase } from './adicionar-insumo-na-os.use-case';
import {
  InsumoRepoFake,
  novaOs,
  novoInsumo,
  OsRepoFake,
  UowFake,
} from './fakes.spec-helper';

describe('AdicionarInsumoNaOsUseCase', () => {
  it('lança OsNaoEncontradaException quando a OS não existe', async () => {
    const uc = new AdicionarInsumoNaOsUseCase(
      new OsRepoFake(null),
      new InsumoRepoFake(novoInsumo(10)),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', insumoId: 7, qtdConsumida: 1 }),
    ).rejects.toBeInstanceOf(OsNaoEncontradaException);
  });

  it('lança InsumoNaoEncontradoException quando o insumo não existe', async () => {
    const uc = new AdicionarInsumoNaOsUseCase(
      new OsRepoFake(novaOs()),
      new InsumoRepoFake(null),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', insumoId: 7, qtdConsumida: 1 }),
    ).rejects.toBeInstanceOf(InsumoNaoEncontradoException);
  });

  it('debita do estoque a quantidade consumida e aplica a linha na OS', async () => {
    const os = novaOs();
    const insumo = novoInsumo(10);
    const osRepo = new OsRepoFake(os);
    const insumoRepo = new InsumoRepoFake(insumo);
    const uow = new UowFake();

    await new AdicionarInsumoNaOsUseCase(osRepo, insumoRepo, uow).executar({
      osId: 'os-1',
      insumoId: 7,
      qtdConsumida: 4,
    });

    expect(insumo.qtdEstoque).toBe(6);
    expect(os.quantidadeDeInsumo(7)).toBe(4);
    expect(uow.executou).toBe(true);
    expect(insumoRepo.salvar).toHaveBeenCalledWith(insumo);
    expect(osRepo.salvar).toHaveBeenCalledWith(os);
  });

  it('debita apenas a diferença ao aumentar a quantidade já lançada', async () => {
    const os = novaOs();
    const insumo = novoInsumo(10);
    const uc = new AdicionarInsumoNaOsUseCase(
      new OsRepoFake(os),
      new InsumoRepoFake(insumo),
      new UowFake(),
    );

    await uc.executar({ osId: 'os-1', insumoId: 7, qtdConsumida: 3 });
    await uc.executar({ osId: 'os-1', insumoId: 7, qtdConsumida: 5 });

    // 10 - 3 - 2 = 5: a segunda chamada só consome o delta.
    expect(insumo.qtdEstoque).toBe(5);
    expect(os.quantidadeDeInsumo(7)).toBe(5);
  });

  it('devolve estoque ao reduzir a quantidade já lançada', async () => {
    const os = novaOs();
    const insumo = novoInsumo(10);
    const uc = new AdicionarInsumoNaOsUseCase(
      new OsRepoFake(os),
      new InsumoRepoFake(insumo),
      new UowFake(),
    );

    await uc.executar({ osId: 'os-1', insumoId: 7, qtdConsumida: 5 });
    await uc.executar({ osId: 'os-1', insumoId: 7, qtdConsumida: 2 });

    expect(insumo.qtdEstoque).toBe(8);
  });

  it('rejeita quando o estoque não cobre a quantidade pedida', async () => {
    const uc = new AdicionarInsumoNaOsUseCase(
      new OsRepoFake(novaOs()),
      new InsumoRepoFake(novoInsumo(2)),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', insumoId: 7, qtdConsumida: 5 }),
    ).rejects.toBeInstanceOf(EstoqueInsuficienteException);
  });
});
