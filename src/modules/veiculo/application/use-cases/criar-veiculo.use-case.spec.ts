import { Cliente } from '../../../cliente/domain/entities/cliente.entity';
import { ClienteNaoEncontradoException } from '../../../cliente/domain/exceptions/cliente-nao-encontrado.exception';
import { ClienteRepository } from '../../../cliente/domain/repositories/cliente.repository';
import { TipoCliente } from '../../../cliente/domain/value-objects/tipo-cliente.vo';
import { Veiculo } from '../../domain/entities/veiculo.entity';
import { PlacaJaCadastradaException } from '../../domain/exceptions/placa-ja-cadastrada.exception';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';
import { CriarVeiculoUseCase } from './criar-veiculo.use-case';

class VeiculoRepoFake implements VeiculoRepository {
  veiculos: Veiculo[] = [];
  placaExiste = false;
  salvar = jest.fn((v: Veiculo): Promise<void> => {
    this.veiculos.push(v);
    return Promise.resolve();
  });
  buscarPorId = jest.fn(
    (id: string): Promise<Veiculo | null> =>
      Promise.resolve(this.veiculos.find((v) => v.veiculoId === id) ?? null),
  );
  listar = jest.fn((): Promise<Veiculo[]> => Promise.resolve(this.veiculos));
  existeComPlaca = jest.fn(
    (): Promise<boolean> => Promise.resolve(this.placaExiste),
  );
}

class ClienteRepoFake implements ClienteRepository {
  clientePresente: Cliente | null = null;
  salvar = jest.fn((): Promise<void> => Promise.resolve());
  buscarPorId = jest.fn(
    (): Promise<Cliente | null> => Promise.resolve(this.clientePresente),
  );
  listar = jest.fn((): Promise<Cliente[]> => Promise.resolve([]));
  existeComDocumento = jest.fn((): Promise<boolean> => Promise.resolve(false));
}

const clienteId = '6a3bd4e0-db9d-4b9a-bb1a-c63dabfa89d2';

const input = {
  placa: 'ABC1D23',
  clienteId,
  marca: 'Toyota',
  modelo: 'Corolla',
  ano: '2020',
  cor: 'Preto',
};

function clienteExistente(): Cliente {
  return Cliente.criar({
    clienteId,
    nome: 'Maria',
    telefone: '11',
    numDocumento: '111.444.777-35',
    tipo: TipoCliente.pessoaFisica(),
  });
}

describe('CriarVeiculoUseCase', () => {
  it('rejeita quando já existe veículo com a mesma placa', async () => {
    const repo = new VeiculoRepoFake();
    const clienteRepo = new ClienteRepoFake();
    clienteRepo.clientePresente = clienteExistente();
    repo.placaExiste = true;
    const uc = new CriarVeiculoUseCase(repo, clienteRepo);
    await expect(uc.executar(input)).rejects.toBeInstanceOf(
      PlacaJaCadastradaException,
    );
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('rejeita quando o cliente proprietário não existe', async () => {
    const repo = new VeiculoRepoFake();
    const clienteRepo = new ClienteRepoFake();
    const uc = new CriarVeiculoUseCase(repo, clienteRepo);
    await expect(uc.executar(input)).rejects.toBeInstanceOf(
      ClienteNaoEncontradoException,
    );
    expect(repo.salvar).not.toHaveBeenCalled();
  });

  it('cria e persiste quando placa é nova e cliente existe', async () => {
    const repo = new VeiculoRepoFake();
    const clienteRepo = new ClienteRepoFake();
    clienteRepo.clientePresente = clienteExistente();
    const uc = new CriarVeiculoUseCase(repo, clienteRepo);
    const veiculo = await uc.executar(input);
    expect(veiculo).toBeInstanceOf(Veiculo);
    expect(veiculo.placa.valor).toBe('ABC1D23');
    expect(veiculo.clienteProprietarioId).toBe(clienteId);
    expect(repo.salvar).toHaveBeenCalledTimes(1);
  });
});
