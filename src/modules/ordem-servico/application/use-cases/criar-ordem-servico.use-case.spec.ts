import { Cliente } from '../../domain/entities/cliente.entity';
import { Mecanico } from '../../domain/entities/mecanico.entity';
import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { Veiculo } from '../../domain/entities/veiculo.entity';
import {
  ClienteNaoEncontradoException,
  MecanicoNaoEncontradoException,
  VeiculoNaoEncontradoException,
} from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { VeiculoNaoPertenceAoClienteException } from '../../domain/exceptions/relacionamento-invalido.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { MecanicoRepository } from '../../domain/repositories/mecanico.repository';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';
import { CriarOrdemServicoUseCase } from './criar-ordem-servico.use-case';

class OsRepoFake implements OrdemServicoRepository {
  osSalva?: OrdemServico;
  salvar = jest.fn((os: OrdemServico) => {
    this.osSalva = os;
    return Promise.resolve();
  });
  buscarPorId = jest.fn(
    (): Promise<OrdemServico | null> => Promise.resolve(this.osSalva ?? null),
  );
  listar = jest.fn((): Promise<OrdemServico[]> => Promise.resolve([]));
  tempoMedioExecucaoMs = jest.fn(() => Promise.resolve(0));
}

class MecanicoRepoFake implements MecanicoRepository {
  constructor(private m: Mecanico | null) {}
  buscarPorId(): Promise<Mecanico | null> {
    return Promise.resolve(this.m);
  }
}
class ClienteRepoFake implements ClienteRepository {
  constructor(private c: Cliente | null) {}
  buscarPorId(): Promise<Cliente | null> {
    return Promise.resolve(this.c);
  }
}
class VeiculoRepoFake implements VeiculoRepository {
  constructor(
    private v: Veiculo | null,
    private vinculo: boolean = true,
  ) {}
  buscarPorId(): Promise<Veiculo | null> {
    return Promise.resolve(this.v);
  }
  veiculoPertenceAoCliente(): Promise<boolean> {
    return Promise.resolve(this.vinculo);
  }
}
class UowFake implements UnitOfWork {
  executar<T>(fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}

const input = { mecanicoId: 1, clienteId: 'c1', veiculoId: 'v1' };

type Overrides = {
  mecanico?: Mecanico | null;
  cliente?: Cliente | null;
  veiculo?: Veiculo | null;
  vinculo?: boolean;
};

// Usamos `in` para distinguir "override explícito com null" de "sem override".
// Nullish coalescing (`??`) trata null como ausente e injeta o fallback,
// o que mascarava os testes de "recurso não encontrado".
function make(overrides: Overrides = {}) {
  const mecanico =
    'mecanico' in overrides ? overrides.mecanico : new Mecanico(1, 'João');
  const cliente =
    'cliente' in overrides
      ? overrides.cliente
      : new Cliente('c1', 'Ana', '111');
  const veiculo =
    'veiculo' in overrides
      ? overrides.veiculo
      : new Veiculo('v1', 'AAA-0000', 'Fiat', 'Uno');
  const vinculo = overrides.vinculo ?? true;

  const osRepo = new OsRepoFake();
  const uc = new CriarOrdemServicoUseCase(
    osRepo,
    new MecanicoRepoFake(mecanico ?? null),
    new ClienteRepoFake(cliente ?? null),
    new VeiculoRepoFake(veiculo ?? null, vinculo),
    new UowFake(),
  );
  return { uc, osRepo };
}

describe('CriarOrdemServicoUseCase', () => {
  it('rejeita mecânico inexistente', async () => {
    const { uc } = make({ mecanico: null });
    await expect(uc.executar(input)).rejects.toBeInstanceOf(
      MecanicoNaoEncontradoException,
    );
  });

  it('rejeita cliente inexistente', async () => {
    const { uc } = make({ cliente: null });
    await expect(uc.executar(input)).rejects.toBeInstanceOf(
      ClienteNaoEncontradoException,
    );
  });

  it('rejeita veículo inexistente', async () => {
    const { uc } = make({ veiculo: null });
    await expect(uc.executar(input)).rejects.toBeInstanceOf(
      VeiculoNaoEncontradoException,
    );
  });

  it('rejeita quando veículo não pertence ao cliente', async () => {
    const { uc } = make({ vinculo: false });
    await expect(uc.executar(input)).rejects.toBeInstanceOf(
      VeiculoNaoPertenceAoClienteException,
    );
  });

  it('persiste OS quando tudo confere', async () => {
    const { uc, osRepo } = make();
    const os = await uc.executar(input);
    expect(os).toBeInstanceOf(OrdemServico);
    expect(osRepo.salvar).toHaveBeenCalledTimes(1);
    expect(os.status.valor).toBe('recebida');
  });
});
