import { Injectable } from '@nestjs/common';
import { Peca } from '../../domain/entities/peca.entity';
import { PecaRepository } from '../../domain/repositories/peca.repository';
import { Dinheiro } from '../../domain/value-objects/dinheiro.vo';
import { PrismaTransactionContext } from './prisma-transaction-context';

@Injectable()
export class PrismaPecaRepository extends PecaRepository {
  constructor(private readonly ctx: PrismaTransactionContext) {
    super();
  }

  async buscarPorId(pecaId: number): Promise<Peca | null> {
    const raw = await this.ctx.cliente().peca.findUnique({
      where: { pecaId },
    });
    if (!raw || raw.deletadoEm) return null;
    return Peca.reconstituir({
      pecaId: raw.pecaId,
      nome: raw.nome,
      qtdEstoque: raw.qtdEstoque,
      valorUn: Dinheiro.deNumero(Number(raw.valorUn)),
    });
  }

  async salvar(peca: Peca): Promise<void> {
    await this.ctx.cliente().peca.update({
      where: { pecaId: peca.pecaId },
      data: { qtdEstoque: peca.qtdEstoque },
    });
  }
}
