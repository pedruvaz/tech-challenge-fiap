import { Servico } from '../../domain/entities/servico.entity';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { ServicoNaoEncontradoException } from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { ServicoRepository } from '../../domain/repositories/servico.repository';
import { Dinheiro } from '../../domain/value-objects/dinheiro.vo';
import { AdicionarServicoNaOsUseCase } from './adicionar-servico-na-os.use-case';
import { novaOs, OsRepoFake, UowFake } from './fakes.spec-helper';

const servicoRepo = (servico: Servico | null): ServicoRepository => ({
  buscarPorId: jest.fn().mockResolvedValue(servico),
});

const novoServico = (): Servico =>
  new Servico(5, 'Troca de óleo', Dinheiro.deNumero(120));

describe('AdicionarServicoNaOsUseCase', () => {
  it('lança OsNaoEncontradaException quando a OS não existe', async () => {
    const uc = new AdicionarServicoNaOsUseCase(
      new OsRepoFake(null),
      servicoRepo(novoServico()),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', servicoId: 5, quantidade: 1 }),
    ).rejects.toBeInstanceOf(OsNaoEncontradaException);
  });

  it('lança ServicoNaoEncontradoException quando o serviço não existe', async () => {
    const uc = new AdicionarServicoNaOsUseCase(
      new OsRepoFake(novaOs()),
      servicoRepo(null),
      new UowFake(),
    );

    await expect(
      uc.executar({ osId: 'os-1', servicoId: 5, quantidade: 1 }),
    ).rejects.toBeInstanceOf(ServicoNaoEncontradoException);
  });

  it('aplica a linha de serviço na OS e persiste na unidade de trabalho', async () => {
    const os = novaOs();
    const osRepo = new OsRepoFake(os);
    const uow = new UowFake();

    await new AdicionarServicoNaOsUseCase(
      osRepo,
      servicoRepo(novoServico()),
      uow,
    ).executar({ osId: 'os-1', servicoId: 5, quantidade: 2 });

    expect(os.quantidadeDeServico(5)).toBe(2);
    expect(uow.executou).toBe(true);
    expect(osRepo.salvar).toHaveBeenCalledWith(os);
  });

  it('sobrescreve a quantidade quando o mesmo serviço é lançado de novo', async () => {
    const os = novaOs();
    const uc = new AdicionarServicoNaOsUseCase(
      new OsRepoFake(os),
      servicoRepo(novoServico()),
      new UowFake(),
    );

    await uc.executar({ osId: 'os-1', servicoId: 5, quantidade: 2 });
    await uc.executar({ osId: 'os-1', servicoId: 5, quantidade: 4 });

    expect(os.quantidadeDeServico(5)).toBe(4);
  });
});
