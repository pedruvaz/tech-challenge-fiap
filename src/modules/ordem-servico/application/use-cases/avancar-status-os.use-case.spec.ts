import { TransicaoInvalidaException } from '../../domain/exceptions/transicao-invalida.exception';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { AvancarStatusOsUseCase } from './avancar-status-os.use-case';
import { novaOs, OsRepoFake, UowFake } from './fakes.spec-helper';

describe('AvancarStatusOsUseCase', () => {
  it('lança OsNaoEncontradaException quando a OS não existe', async () => {
    const uc = new AvancarStatusOsUseCase(new OsRepoFake(null), new UowFake());

    await expect(
      uc.executar({ osId: 'os-1', novoStatus: 'em_diagnostico' }),
    ).rejects.toBeInstanceOf(OsNaoEncontradaException);
  });

  it('avança para o próximo status válido e persiste na unidade de trabalho', async () => {
    const os = novaOs();
    const osRepo = new OsRepoFake(os);
    const uow = new UowFake();

    await new AvancarStatusOsUseCase(osRepo, uow).executar({
      osId: 'os-1',
      novoStatus: 'em_diagnostico',
    });

    expect(os.status.valor).toBe('em_diagnostico');
    expect(uow.executou).toBe(true);
    expect(osRepo.salvar).toHaveBeenCalledWith(os);
  });

  it('recusa pular etapas do fluxo', async () => {
    const os = novaOs();
    const osRepo = new OsRepoFake(os);
    const uow = new UowFake();

    await expect(
      new AvancarStatusOsUseCase(osRepo, uow).executar({
        osId: 'os-1',
        novoStatus: 'finalizada',
      }),
    ).rejects.toBeInstanceOf(TransicaoInvalidaException);
    expect(uow.executou).toBe(false);
    expect(osRepo.salvar).not.toHaveBeenCalled();
  });

  it('registra o usuário que promoveu a transição', async () => {
    const os = novaOs();

    await new AvancarStatusOsUseCase(
      new OsRepoFake(os),
      new UowFake(),
    ).executar({ osId: 'os-1', novoStatus: 'em_diagnostico', usuarioId: 3 });

    expect(os.transicoesPendentes).toContainEqual(
      expect.objectContaining({
        statusAnterior: 'recebida',
        statusNovo: 'em_diagnostico',
        usuarioId: 3,
      }),
    );
  });

  it('aceita transição sem usuário autenticado', async () => {
    const os = novaOs();

    await new AvancarStatusOsUseCase(
      new OsRepoFake(os),
      new UowFake(),
    ).executar({ osId: 'os-1', novoStatus: 'em_diagnostico' });

    expect(os.transicoesPendentes).toContainEqual(
      expect.objectContaining({ usuarioId: null }),
    );
  });
});
