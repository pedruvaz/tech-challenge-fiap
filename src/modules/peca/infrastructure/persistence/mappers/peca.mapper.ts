import { Peca as PrismaPeca } from '@prisma/client';
import { Peca } from '../../../domain/entities/peca.entity';

export function reconstituirPeca(raw: PrismaPeca): Peca {
  return Peca.reconstituir({
    pecaId: raw.pecaId,
    nome: raw.nome,
    qtdEstoque: raw.qtdEstoque,
    valorUn: Number(raw.valorUn),
    criadoEm: raw.criadoEm,
    atualizadoEm: raw.atualizadoEm,
    deletadoEm: raw.deletadoEm,
  });
}
