import { Injectable } from '@nestjs/common';
import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';
import { Dinheiro } from '../../domain/value-objects/dinheiro.vo';
import { PrismaTransactionContext } from './prisma-transaction-context';

@Injectable()
export class PrismaInsumoRepository extends InsumoRepository {
  constructor(private readonly ctx: PrismaTransactionContext) {
    super();
  }

  async buscarPorId(insumoId: number): Promise<Insumo | null> {
    const raw = await this.ctx.cliente().insumo.findUnique({
      where: { insumoId },
    });
    if (!raw || raw.deletadoEm) return null;
    return Insumo.reconstituir({
      insumoId: raw.insumoId,
      nome: raw.nome,
      qtdEstoque: raw.qtdEstoque,
      valorUn: Dinheiro.deNumero(Number(raw.valorUn)),
    });
  }

  async salvar(insumo: Insumo): Promise<void> {
    await this.ctx.cliente().insumo.update({
      where: { insumoId: insumo.insumoId },
      data: { qtdEstoque: insumo.qtdEstoque },
    });
  }
}
