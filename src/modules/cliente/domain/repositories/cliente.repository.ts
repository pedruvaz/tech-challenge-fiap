import { Cliente } from '../entities/cliente.entity';

export abstract class ClienteRepository {
  abstract salvar(cliente: Cliente): Promise<void>;
  abstract buscarPorId(clienteId: string): Promise<Cliente | null>;
  abstract listar(): Promise<Cliente[]>;
  abstract existeComDocumento(
    numDocumento: string,
    ignorarClienteId?: string,
  ): Promise<boolean>;
}
