import { Servico } from '../../domain/entities/servico.entity';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { ServicoNaoAssociadoException } from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { ServicoRepository } from '../../domain/repositories/servico.repository';
import { Dinheiro } from '../../domain/value-objects/dinheiro.vo';
import { AdicionarServicoNaOsUseCase } from './adicionar-servico-na-os.use-case';
import { RemoverServicoDaOsUseCase } from './remover-servico-da-os.use-case';
import { novaOs, OsRepoFake, UowFake } from './fakes.spec-helper';

const servicoRepo = (): ServicoRepository => ({
  buscarPorId: jest
    .fn()
    .mockResolvedValue(new Servico(5, 'Troca de óleo', Dinheiro.deNumero(120))),
});

describe('RemoverServicoDaOsUseCase', () => {
  it('lança OsNaoEncontradaException quando a OS não existe', async () => {
    const uc = new RemoverServicoDaOsUseCase(
      new OsRepoFake(null),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', servicoId: 5 }),
    ).rejects.toBeInstanceOf(OsNaoEncontradaException);
  });

  it('lança ServicoNaoAssociadoException quando o serviço não está na OS', async () => {
    const uc = new RemoverServicoDaOsUseCase(
      new OsRepoFake(novaOs()),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', servicoId: 5 }),
    ).rejects.toBeInstanceOf(ServicoNaoAssociadoException);
  });

  it('remove a linha e persiste na unidade de trabalho', async () => {
    const os = novaOs();
    await new AdicionarServicoNaOsUseCase(
      new OsRepoFake(os),
      servicoRepo(),
      new UowFake(),
    ).executar({ osId: 'os-1', servicoId: 5, quantidade: 2 });

    const osRepo = new OsRepoFake(os);
    const uow = new UowFake();

    await new RemoverServicoDaOsUseCase(osRepo, uow).executar({
      osId: 'os-1',
      servicoId: 5,
    });

    expect(os.quantidadeDeServico(5)).toBe(0);
    expect(uow.executou).toBe(true);
    expect(osRepo.salvar).toHaveBeenCalledWith(os);
  });
});
