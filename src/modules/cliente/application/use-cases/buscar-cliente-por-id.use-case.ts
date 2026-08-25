import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteNaoEncontradoException } from '../../domain/exceptions/cliente-nao-encontrado.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';

export class BuscarClientePorIdUseCase {
  constructor(private readonly repo: ClienteRepository) {}

  async executar(clienteId: string): Promise<Cliente> {
    const cliente = await this.repo.buscarPorId(clienteId);
    if (!cliente) throw new ClienteNaoEncontradoException(clienteId);
    return cliente;
  }
}
