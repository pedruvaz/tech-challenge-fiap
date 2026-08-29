import { ListarOrdensServicoUseCase } from './listar-ordens-servico.use-case';
import { novaOs, OsRepoFake } from './fakes.spec-helper';

describe('ListarOrdensServicoUseCase', () => {
  it('delega ao repositório sem filtros', async () => {
    const repo = new OsRepoFake(novaOs());

    const resultado = await new ListarOrdensServicoUseCase(repo).executar();

    expect(repo.listar).toHaveBeenCalledWith(undefined);
    expect(resultado).toHaveLength(1);
  });

  it('repassa os filtros recebidos', async () => {
    const repo = new OsRepoFake(null);
    const filtros = { status: 'em_execucao' as const, clienteId: 'c1' };

    await expect(
      new ListarOrdensServicoUseCase(repo).executar(filtros),
    ).resolves.toEqual([]);
    expect(repo.listar).toHaveBeenCalledWith(filtros);
  });
});
