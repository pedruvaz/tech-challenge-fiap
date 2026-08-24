import { Injectable } from '@nestjs/common';
import { Servico } from '../../domain/entities/servico.entity';
import { ServicoRepository } from '../../domain/repositories/servico.repository';
import { Dinheiro } from '../../domain/value-objects/dinheiro.vo';
import { PrismaTransactionContext } from './prisma-transaction-context';

@Injectable()
export class PrismaServicoRepository extends ServicoRepository {
  constructor(private readonly ctx: PrismaTransactionContext) {
    super();
  }

  async buscarPorId(servicoId: number): Promise<Servico | null> {
    const raw = await this.ctx.cliente().servico.findUnique({
      where: { servicoId },
    });
    if (!raw || raw.deletadoEm) return null;
    return new Servico(
      raw.servicoId,
      raw.descricao,
      Dinheiro.deNumero(Number(raw.valor)),
    );
  }
}
