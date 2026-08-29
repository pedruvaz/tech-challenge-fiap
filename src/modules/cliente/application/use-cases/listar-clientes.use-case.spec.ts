import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { TipoCliente } from '../../domain/value-objects/tipo-cliente.vo';
import { ListarClientesUseCase } from './listar-clientes.use-case';

const repoQueLista = (clientes: Cliente[]): ClienteRepository => ({
  salvar: jest.fn(),
  buscarPorId: jest.fn(),
  listar: jest.fn().mockResolvedValue(clientes),
  existeComDocumento: jest.fn(),
});

describe('ListarClientesUseCase', () => {
  it('delega a listagem ao repositório', async () => {
    const clientes = [
      Cliente.criar({
        clienteId: 'c1',
        nome: 'Maria',
        telefone: '11999999999',
        numDocumento: '111.444.777-35',
        tipo: TipoCliente.pessoaFisica(),
      }),
    ];
    const repo = repoQueLista(clientes);

    await expect(new ListarClientesUseCase(repo).executar()).resolves.toBe(
      clientes,
    );
    expect(repo.listar).toHaveBeenCalledTimes(1);
  });

  it('devolve lista vazia quando não há clientes', async () => {
    await expect(
      new ListarClientesUseCase(repoQueLista([])).executar(),
    ).resolves.toEqual([]);
  });
});
