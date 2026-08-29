import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteNaoEncontradoException } from '../../domain/exceptions/cliente-nao-encontrado.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { TipoCliente } from '../../domain/value-objects/tipo-cliente.vo';
import { RemoverClienteUseCase } from './remover-cliente.use-case';

const repoCom = (cliente: Cliente | null): ClienteRepository => ({
  salvar: jest.fn().mockResolvedValue(undefined),
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

describe('RemoverClienteUseCase', () => {
  it('faz soft delete e persiste', async () => {
    const cliente = clienteExistente();
    const repo = repoCom(cliente);

    await new RemoverClienteUseCase(repo).executar('c1');

    expect(cliente.deletadoEm).toBeInstanceOf(Date);
    expect(repo.salvar).toHaveBeenCalledWith(cliente);
  });

  it('lança ClienteNaoEncontradoException e não salva', async () => {
    const repo = repoCom(null);

    await expect(
      new RemoverClienteUseCase(repo).executar('sumiu'),
    ).rejects.toThrow(ClienteNaoEncontradoException);
    expect(repo.salvar).not.toHaveBeenCalled();
  });
});
