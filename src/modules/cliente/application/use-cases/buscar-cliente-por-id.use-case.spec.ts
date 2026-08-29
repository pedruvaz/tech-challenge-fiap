import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteNaoEncontradoException } from '../../domain/exceptions/cliente-nao-encontrado.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { TipoCliente } from '../../domain/value-objects/tipo-cliente.vo';
import { BuscarClientePorIdUseCase } from './buscar-cliente-por-id.use-case';

const repoCom = (cliente: Cliente | null): ClienteRepository => ({
  salvar: jest.fn(),
  buscarPorId: jest.fn().mockResolvedValue(cliente),
  listar: jest.fn(),
  existeComDocumento: jest.fn(),
});

const clienteExistente = (): Cliente =>
  Cliente.criar({
    clienteId: 'c1',
    nome: 'Maria',
    telefone: '11999999999',
    numDocumento: '111.444.777-35',
    tipo: TipoCliente.pessoaFisica(),
  });

describe('BuscarClientePorIdUseCase', () => {
  it('devolve o cliente encontrado', async () => {
    const cliente = clienteExistente();
    const repo = repoCom(cliente);

    await expect(
      new BuscarClientePorIdUseCase(repo).executar('c1'),
    ).resolves.toBe(cliente);
    expect(repo.buscarPorId).toHaveBeenCalledWith('c1');
  });

  it('lança ClienteNaoEncontradoException quando não existe', async () => {
    await expect(
      new BuscarClientePorIdUseCase(repoCom(null)).executar('sumiu'),
    ).rejects.toThrow(ClienteNaoEncontradoException);
  });
});
