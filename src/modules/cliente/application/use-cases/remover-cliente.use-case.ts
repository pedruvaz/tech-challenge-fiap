import { ClienteNaoEncontradoException } from '../../domain/exceptions/cliente-nao-encontrado.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';

export class RemoverClienteUseCase {
  constructor(private readonly repo: ClienteRepository) {}

  async executar(clienteId: string): Promise<void> {
    const cliente = await this.repo.buscarPorId(clienteId);
    if (!cliente) throw new ClienteNaoEncontradoException(clienteId);

    cliente.softDelete();
    await this.repo.salvar(cliente);
  }
}
