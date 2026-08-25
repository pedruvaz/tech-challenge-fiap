import { Injectable } from '@nestjs/common';
import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { PrismaTransactionContext } from './prisma-transaction-context';

@Injectable()
export class PrismaClienteRepository extends ClienteRepository {
  constructor(private readonly ctx: PrismaTransactionContext) {
    super();
  }

  async buscarPorId(clienteId: string): Promise<Cliente | null> {
    const raw = await this.ctx.cliente().cliente.findFirst({
      where: { clienteId, deletadoEm: null },
    });
    return raw ? new Cliente(raw.clienteId, raw.nome, raw.numDocumento) : null;
  }
}
