import { Insumo as PrismaInsumo } from '@prisma/client';
import { Insumo } from '../../../domain/entities/insumo.entity';

export function reconstituirInsumo(raw: PrismaInsumo): Insumo {
  return Insumo.reconstituir({
    insumoId: raw.insumoId,
    nome: raw.nome,
    qtdEstoque: raw.qtdEstoque,
    valorUn: Number(raw.valorUn),
    criadoEm: raw.criadoEm,
    atualizadoEm: raw.atualizadoEm,
    deletadoEm: raw.deletadoEm,
  });
}
