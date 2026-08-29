import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import {
  InsumoNaoAssociadoException,
  InsumoNaoEncontradoException,
} from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { AdicionarInsumoNaOsUseCase } from './adicionar-insumo-na-os.use-case';
import { RemoverInsumoDaOsUseCase } from './remover-insumo-da-os.use-case';
import {
  InsumoRepoFake,
  novaOs,
  novoInsumo,
  OsRepoFake,
  UowFake,
} from './fakes.spec-helper';

describe('RemoverInsumoDaOsUseCase', () => {
  it('lança OsNaoEncontradaException quando a OS não existe', async () => {
    const uc = new RemoverInsumoDaOsUseCase(
      new OsRepoFake(null),
      new InsumoRepoFake(novoInsumo(10)),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', insumoId: 7 }),
    ).rejects.toBeInstanceOf(OsNaoEncontradaException);
  });

  it('lança InsumoNaoAssociadoException quando o insumo não está na OS', async () => {
    const uc = new RemoverInsumoDaOsUseCase(
      new OsRepoFake(novaOs()),
      new InsumoRepoFake(novoInsumo(10)),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', insumoId: 7 }),
    ).rejects.toBeInstanceOf(InsumoNaoAssociadoException);
  });

  it('lança InsumoNaoEncontradoException se o catálogo perdeu o insumo', async () => {
    const os = novaOs();
    await new AdicionarInsumoNaOsUseCase(
      new OsRepoFake(os),
      new InsumoRepoFake(novoInsumo(10)),
      new UowFake(),
    ).executar({ osId: 'os-1', insumoId: 7, qtdConsumida: 3 });

    const uc = new RemoverInsumoDaOsUseCase(
      new OsRepoFake(os),
      new InsumoRepoFake(null),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', insumoId: 7 }),
    ).rejects.toBeInstanceOf(InsumoNaoEncontradoException);
  });

  it('estorna o estoque e remove a linha da OS', async () => {
    const os = novaOs();
    const insumo = novoInsumo(10);
    await new AdicionarInsumoNaOsUseCase(
      new OsRepoFake(os),
      new InsumoRepoFake(insumo),
      new UowFake(),
    ).executar({ osId: 'os-1', insumoId: 7, qtdConsumida: 4 });
    expect(insumo.qtdEstoque).toBe(6);

    const osRepo = new OsRepoFake(os);
    const insumoRepo = new InsumoRepoFake(insumo);
    const uow = new UowFake();

    await new RemoverInsumoDaOsUseCase(osRepo, insumoRepo, uow).executar({
      osId: 'os-1',
      insumoId: 7,
    });

    expect(insumo.qtdEstoque).toBe(10);
    expect(os.quantidadeDeInsumo(7)).toBe(0);
    expect(uow.executou).toBe(true);
    expect(insumoRepo.salvar).toHaveBeenCalledWith(insumo);
    expect(osRepo.salvar).toHaveBeenCalledWith(os);
  });
});
