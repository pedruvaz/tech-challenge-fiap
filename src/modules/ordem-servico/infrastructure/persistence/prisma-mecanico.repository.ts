import { Injectable } from '@nestjs/common';
import { Mecanico } from '../../domain/entities/mecanico.entity';
import { MecanicoRepository } from '../../domain/repositories/mecanico.repository';
import { PrismaTransactionContext } from './prisma-transaction-context';

@Injectable()
export class PrismaMecanicoRepository extends MecanicoRepository {
  constructor(private readonly ctx: PrismaTransactionContext) {
    super();
  }

  async buscarPorId(id: number): Promise<Mecanico | null> {
    const raw = await this.ctx.cliente().usuario.findFirst({
      where: { idUsuario: id, deletadoEm: null },
    });
    return raw ? new Mecanico(raw.idUsuario, raw.nome) : null;
  }
}
