import { Prisma } from '@prisma/client';
import type { Status } from '@prisma/client';
import { InsumoConsumido } from '../../../domain/entities/insumo-consumido.entity';
import { OrdemServico } from '../../../domain/entities/ordem-servico.entity';
import { PecaUtilizada } from '../../../domain/entities/peca-utilizada.entity';
import { ServicoRealizado } from '../../../domain/entities/servico-realizado.entity';
import { Dinheiro } from '../../../domain/value-objects/dinheiro.vo';
import { StatusOS } from '../../../domain/value-objects/status-os.vo';
import type { StatusOSValor } from '../../../domain/value-objects/status-os.vo';

// Formato "cru" que a raiz do agregado precisa para ser reconstituída.
type RawOs = {
  osId: string;
  usuarioId: number;
  clienteId: string;
  veiculoId: string;
  status: Status;
  criadoEm: Date;
  atualizadoEm: Date;
  deletadoEm: Date | null;
  servicosRealizados?: Array<{
    servicoId: number;
    quantidade: number;
    valor: Prisma.Decimal | number | string;
  }>;
  pecasUtilizadas?: Array<{
    pecaId: number;
    qtd: number;
    valor: Prisma.Decimal | number | string;
  }>;
  insumosConsumidos?: Array<{
    insumoId: number;
    qtdConsumida: number;
    valor: Prisma.Decimal | number | string;
  }>;
};

function paraDinheiro(v: Prisma.Decimal | number | string): Dinheiro {
  if (typeof v === 'number') return Dinheiro.deNumero(v);
  if (typeof v === 'string') return Dinheiro.deString(v);
  return Dinheiro.deNumero(v.toNumber());
}

export function reconstituirOrdemServico(raw: RawOs): OrdemServico {
  return OrdemServico.reconstituir({
    osId: raw.osId,
    mecanicoId: raw.usuarioId,
    clienteId: raw.clienteId,
    veiculoId: raw.veiculoId,
    status: StatusOS.de(raw.status as StatusOSValor),
    criadoEm: raw.criadoEm,
    atualizadoEm: raw.atualizadoEm,
    deletadoEm: raw.deletadoEm,
    servicos: (raw.servicosRealizados ?? []).map(
      (sr) => new ServicoRealizado(sr.servicoId, sr.quantidade, paraDinheiro(sr.valor)),
    ),
    pecas: (raw.pecasUtilizadas ?? []).map(
      (pu) => new PecaUtilizada(pu.pecaId, pu.qtd, paraDinheiro(pu.valor)),
    ),
    insumos: (raw.insumosConsumidos ?? []).map(
      (ic) => new InsumoConsumido(ic.insumoId, ic.qtdConsumida, paraDinheiro(ic.valor)),
    ),
  });
}
