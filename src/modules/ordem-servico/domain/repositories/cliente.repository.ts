import { Cliente } from '../entities/cliente.entity';

export abstract class ClienteRepository {
  abstract buscarPorId(clienteId: string): Promise<Cliente | null>;
}
