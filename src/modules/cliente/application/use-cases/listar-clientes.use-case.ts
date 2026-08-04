import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';

export class ListarClientesUseCase {
  constructor(private readonly repo: ClienteRepository) {}

  executar(): Promise<Cliente[]> {
    return this.repo.listar();
  }
}
