import { AprovacaoInvalidaException } from '../../domain/exceptions/aprovacao-invalida.exception';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { AprovarOrcamentoUseCase } from './aprovar-orcamento.use-case';
import { novaOs, OsRepoFake, UowFake } from './fakes.spec-helper';

const osAguardandoAprovacao = (): OrdemServico => {
  const os = novaOs();
  os.avancarStatus('em_diagnostico');
  os.avancarStatus('aguardando_aprovacao');
  return os;
};

describe('AprovarOrcamentoUseCase', () => {
  it('lança OsNaoEncontradaException quando a OS não existe', async () => {
    const uc = new AprovarOrcamentoUseCase(new OsRepoFake(null), new UowFake());

    await expect(uc.executar({ osId: 'os-1' })).rejects.toBeInstanceOf(
      OsNaoEncontradaException,
    );
  });

  it('move a OS de aguardando_aprovacao para em_execucao', async () => {
    const os = osAguardandoAprovacao();
    const osRepo = new OsRepoFake(os);
    const uow = new UowFake();

    await new AprovarOrcamentoUseCase(osRepo, uow).executar({ osId: 'os-1' });

    expect(os.status.valor).toBe('em_execucao');
    expect(uow.executou).toBe(true);
    expect(osRepo.salvar).toHaveBeenCalledWith(os);
  });

  it('recusa aprovar OS que não está aguardando aprovação', async () => {
    const osRepo = new OsRepoFake(novaOs());
    const uow = new UowFake();

    await expect(
      new AprovarOrcamentoUseCase(osRepo, uow).executar({ osId: 'os-1' }),
    ).rejects.toBeInstanceOf(AprovacaoInvalidaException);
    expect(uow.executou).toBe(false);
    expect(osRepo.salvar).not.toHaveBeenCalled();
  });

  it('registra o usuário que aprovou', async () => {
    const os = osAguardandoAprovacao();

    await new AprovarOrcamentoUseCase(
      new OsRepoFake(os),
      new UowFake(),
    ).executar({ osId: 'os-1', usuarioId: 3 });

    expect(os.transicoesPendentes).toContainEqual(
      expect.objectContaining({
        statusAnterior: 'aguardando_aprovacao',
        statusNovo: 'em_execucao',
        usuarioId: 3,
      }),
    );
  });

  it('aceita aprovação sem usuário (fluxo público do cliente)', async () => {
    const os = osAguardandoAprovacao();

    await new AprovarOrcamentoUseCase(
      new OsRepoFake(os),
      new UowFake(),
    ).executar({ osId: 'os-1' });

    expect(os.transicoesPendentes).toContainEqual(
      expect.objectContaining({ statusNovo: 'em_execucao', usuarioId: null }),
    );
  });
});
