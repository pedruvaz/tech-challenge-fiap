import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { Peca } from '../../domain/entities/peca.entity';
import { EstoqueInsuficienteException } from '../../domain/exceptions/estoque-insuficiente.exception';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { PecaNaoEncontradaException } from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { PecaRepository } from '../../domain/repositories/peca.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';
import { Dinheiro } from '../../domain/value-objects/dinheiro.vo';
import { AdicionarPecaNaOsUseCase } from './adicionar-peca-na-os.use-case';

class OsRepoFake implements OrdemServicoRepository {
  constructor(private os: OrdemServico | null) {}
  salvar = jest.fn(async () => undefined);
  buscarPorId = jest.fn(async (): Promise<OrdemServico | null> => this.os);
  listar = jest.fn(async () => [] as OrdemServico[]);
  tempoMedioExecucaoMs = jest.fn(async () => 0);
}

class PecaRepoFake implements PecaRepository {
  constructor(private peca: Peca | null) {}
  buscarPorId = jest.fn(async () => this.peca);
  salvar = jest.fn(async () => undefined);
}

class UowFake implements UnitOfWork {
  executar = <T>(fn: () => Promise<T>): Promise<T> => fn();
}

function novaOs(): OrdemServico {
  return OrdemServico.criar({
    osId: 'os-1',
    mecanicoId: 1,
    clienteId: 'c',
    veiculoId: 'v',
  });
}

function novaPeca(estoque: number): Peca {
  return Peca.reconstituir({
    pecaId: 42,
    nome: 'Vela',
    qtdEstoque: estoque,
    valorUn: Dinheiro.deNumero(10),
  });
}

describe('AdicionarPecaNaOsUseCase', () => {
  it('lança se OS não existir', async () => {
    const uc = new AdicionarPecaNaOsUseCase(
      new OsRepoFake(null),
      new PecaRepoFake(null),
      new UowFake(),
    );
    await expect(
      uc.executar({ osId: 'os-1', pecaId: 42, qtd: 1 }),
    ).rejects.toBeInstanceOf(OsNaoEncontradaException);
  });

  it('lança se peça não existir', async () => {
    const uc = new AdicionarPecaNaOsUseCase(
      new OsRepoFake(novaOs()),
      new PecaRepoFake(null),
      new UowFake(),
    );
    await expect(
      uc.executar({ osId: 'os-1', pecaId: 42, qtd: 1 }),
    ).rejects.toBeInstanceOf(PecaNaoEncontradaException);
  });

  it('debita estoque pela diferença ao aumentar quantidade', async () => {
    const os = novaOs();
    const peca = novaPeca(10);
    const uc = new AdicionarPecaNaOsUseCase(
      new OsRepoFake(os),
      new PecaRepoFake(peca),
      new UowFake(),
    );
    await uc.executar({ osId: 'os-1', pecaId: 42, qtd: 3 });
    expect(peca.qtdEstoque).toBe(7);
    expect(os.quantidadeDePeca(42)).toBe(3);
  });

  it('recusa quando estoque insuficiente', async () => {
    const os = novaOs();
    const peca = novaPeca(2);
    const uc = new AdicionarPecaNaOsUseCase(
      new OsRepoFake(os),
      new PecaRepoFake(peca),
      new UowFake(),
    );
    await expect(
      uc.executar({ osId: 'os-1', pecaId: 42, qtd: 5 }),
    ).rejects.toBeInstanceOf(EstoqueInsuficienteException);
  });
});
