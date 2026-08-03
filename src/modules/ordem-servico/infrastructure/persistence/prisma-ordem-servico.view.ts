import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FiltrosOrdemServico } from '../../domain/repositories/ordem-servico.repository';
import {
  OrdemServicoView,
  OrdemServicoViewRepository,
} from '../../domain/repositories/ordem-servico.view';
import { StatusOSValor } from '../../domain/value-objects/status-os.vo';
import { PrismaTransactionContext } from './prisma-transaction-context';

// Includes reutilizados nas duas queries de leitura. Idênticos aos joins
// usados pelo controller anterior, para preservar a shape da resposta HTTP.
const includes = {
  mecanico: { select: { idUsuario: true, nome: true } },
  cliente: {
    select: { clienteId: true, nome: true, numDocumento: true },
  },
  veiculo: {
    select: { veiculoId: true, placa: true, marca: true, modelo: true },
  },
  servicosRealizados: { include: { servico: true } },
  pecasUtilizadas: { include: { peca: true } },
  insumosConsumidos: { include: { insumo: true } },
} satisfies Prisma.OrdemServicoInclude;

type RawRow = Prisma.OrdemServicoGetPayload<{ include: typeof includes }>;

function paraNumero(v: Prisma.Decimal | number | string): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  return v.toNumber();
}

function projetar(row: RawRow): OrdemServicoView {
  return {
    osId: row.osId,
    usuarioId: row.usuarioId,
    clienteId: row.clienteId,
    veiculoId: row.veiculoId,
    status: row.status as StatusOSValor,
    valorFinal: paraNumero(row.valorFinal),
    criadoEm: row.criadoEm,
    atualizadoEm: row.atualizadoEm,
    deletadoEm: row.deletadoEm,
    mecanico: row.mecanico
      ? { idUsuario: row.mecanico.idUsuario, nome: row.mecanico.nome }
      : null,
    cliente: row.cliente
      ? {
          clienteId: row.cliente.clienteId,
          nome: row.cliente.nome,
          numDocumento: row.cliente.numDocumento,
        }
      : null,
    veiculo: row.veiculo
      ? {
          veiculoId: row.veiculo.veiculoId,
          placa: row.veiculo.placa,
          marca: row.veiculo.marca,
          modelo: row.veiculo.modelo,
        }
      : null,
    servicosRealizados: row.servicosRealizados.map((sr) => ({
      servicoId: sr.servicoId,
      descricao: sr.servico?.descricao ?? '',
      quantidade: sr.quantidade,
      valor: paraNumero(sr.valor),
    })),
    pecasUtilizadas: row.pecasUtilizadas.map((pu) => ({
      pecaId: pu.pecaId,
      nome: pu.peca?.nome ?? '',
      qtd: pu.qtd,
      valor: paraNumero(pu.valor),
    })),
    insumosConsumidos: row.insumosConsumidos.map((ic) => ({
      insumoId: ic.insumoId,
      nome: ic.insumo?.nome ?? '',
      qtdConsumida: ic.qtdConsumida,
      valor: paraNumero(ic.valor),
    })),
  };
}

@Injectable()
export class PrismaOrdemServicoView extends OrdemServicoViewRepository {
  constructor(private readonly ctx: PrismaTransactionContext) {
    super();
  }

  async buscarPorId(osId: string): Promise<OrdemServicoView | null> {
    const row = await this.ctx.cliente().ordemServico.findFirst({
      where: { osId, deletadoEm: null },
      include: includes,
    });
    return row ? projetar(row) : null;
  }

  async listar(filtros?: FiltrosOrdemServico): Promise<OrdemServicoView[]> {
    const rows = await this.ctx.cliente().ordemServico.findMany({
      where: {
        deletadoEm: null,
        ...(filtros?.status ? { status: filtros.status } : {}),
        ...(filtros?.clienteId ? { clienteId: filtros.clienteId } : {}),
      },
      include: includes,
    });
    return rows.map(projetar);
  }
}
