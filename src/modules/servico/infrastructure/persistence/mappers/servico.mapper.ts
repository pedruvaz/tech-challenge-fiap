import { Servico as PrismaServico } from '@prisma/client';
import { Servico } from '../../../domain/entities/servico.entity';

export function reconstituirServico(raw: PrismaServico): Servico {
  return Servico.reconstituir({
    servicoId: raw.servicoId,
    descricao: raw.descricao,
    valor: Number(raw.valor),
    criadoEm: raw.criadoEm,
    atualizadoEm: raw.atualizadoEm,
    deletadoEm: raw.deletadoEm,
  });
}
