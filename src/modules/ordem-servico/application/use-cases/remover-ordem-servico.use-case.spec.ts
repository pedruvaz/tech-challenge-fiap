import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { RemoverOrdemServicoUseCase } from './remover-ordem-servico.use-case';
import { novaOs, OsRepoFake, UowFake } from './fakes.spec-helper';

describe('RemoverOrdemServicoUseCase', () => {
  it('faz soft delete e persiste dentro da unidade de trabalho', async () => {
    const os = novaOs();
    const repo = new OsRepoFake(os);
    const uow = new UowFake();

    await new RemoverOrdemServicoUseCase(repo, uow).executar('os-1');

    expect(os.deletadoEm).toBeInstanceOf(Date);
    expect(uow.executou).toBe(true);
    expect(repo.salvar).toHaveBeenCalledWith(os);
  });

  it('lança OsNaoEncontradaException e não abre transação', async () => {
    const repo = new OsRepoFake(null);
    const uow = new UowFake();

    await expect(
      new RemoverOrdemServicoUseCase(repo, uow).executar('x'),
    ).rejects.toThrow(OsNaoEncontradaException);
    expect(uow.executou).toBe(false);
    expect(repo.salvar).not.toHaveBeenCalled();
  });
});
