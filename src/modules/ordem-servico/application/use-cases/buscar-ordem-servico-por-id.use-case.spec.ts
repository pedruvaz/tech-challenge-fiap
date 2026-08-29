import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { BuscarOrdemServicoPorIdUseCase } from './buscar-ordem-servico-por-id.use-case';
import { novaOs, OsRepoFake } from './fakes.spec-helper';

describe('BuscarOrdemServicoPorIdUseCase', () => {
  it('devolve a OS encontrada', async () => {
    const os = novaOs();
    const repo = new OsRepoFake(os);

    await expect(
      new BuscarOrdemServicoPorIdUseCase(repo).executar('os-1'),
    ).resolves.toBe(os);
    expect(repo.buscarPorId).toHaveBeenCalledWith('os-1');
  });

  it('lança OsNaoEncontradaException quando não existe', async () => {
    await expect(
      new BuscarOrdemServicoPorIdUseCase(new OsRepoFake(null)).executar('x'),
    ).rejects.toThrow(OsNaoEncontradaException);
  });
});
