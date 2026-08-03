import { Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import {
  FiltrosOrdemServico,
  OrdemServicoRepository,
} from '../../domain/repositories/ordem-servico.repository';
import { reconstituirOrdemServico } from './mappers/ordem-servico.mapper';
import { PrismaTransactionContext } from './prisma-transaction-context';

@Injectable()
export class PrismaOrdemServicoRepository extends OrdemServicoRepository {
  constructor(private readonly ctx: PrismaTransactionContext) {
    super();
  }

  async buscarPorId(osId: string): Promise<OrdemServico | null> {
    const raw = await this.ctx.cliente().ordemServico.findFirst({
      where: { osId, deletadoEm: null },
      include: {
        servicosRealizados: true,
        pecasUtilizadas: true,
        insumosConsumidos: true,
      },
    });
    return raw ? reconstituirOrdemServico(raw) : null;
  }

  async listar(filtros?: FiltrosOrdemServico): Promise<OrdemServico[]> {
    const rows = await this.ctx.cliente().ordemServico.findMany({
      where: {
        deletadoEm: null,
        ...(filtros?.status ? { status: filtros.status } : {}),
        ...(filtros?.clienteId ? { clienteId: filtros.clienteId } : {}),
      },
      include: {
        servicosRealizados: true,
        pecasUtilizadas: true,
        insumosConsumidos: true,
      },
    });
    return rows.map(reconstituirOrdemServico);
  }

  async salvar(os: OrdemServico): Promise<void> {
    const cliente = this.ctx.cliente();
    const valorFinal = os.valorFinal().paraNumero();
    const status = os.status.valor as Status;

    if (os.foiCriadaAgora) {
      await cliente.ordemServico.create({
        data: {
          osId: os.osId,
          usuarioId: os.mecanicoId,
          clienteId: os.clienteId,
          veiculoId: os.veiculoId,
          status,
          valorFinal,
        },
      });
    } else {
      await cliente.ordemServico.update({
        where: { osId: os.osId },
        data: {
          status,
          valorFinal,
          deletadoEm: os.deletadoEm,
        },
      });
    }

    // Sincroniza coleções filhas por delete-and-insert. Simples e correto
    // dentro de uma transação; itens da OS não têm identidade própria além
    // da chave composta (osId, itemId).
    await cliente.servicoRealizado.deleteMany({ where: { osId: os.osId } });
    if (os.servicos.length > 0) {
      await cliente.servicoRealizado.createMany({
        data: os.servicos.map((s) => ({
          osId: os.osId,
          servicoId: s.servicoId,
          quantidade: s.quantidade,
          valor: s.valorUnitario.paraNumero(),
        })),
      });
    }

    await cliente.pecaUtilizada.deleteMany({ where: { osId: os.osId } });
    if (os.pecas.length > 0) {
      await cliente.pecaUtilizada.createMany({
        data: os.pecas.map((p) => ({
          osId: os.osId,
          pecaId: p.pecaId,
          qtd: p.qtd,
          valor: p.valorUnitario.paraNumero(),
        })),
      });
    }

    await cliente.insumoConsumido.deleteMany({ where: { osId: os.osId } });
    if (os.insumos.length > 0) {
      await cliente.insumoConsumido.createMany({
        data: os.insumos.map((i) => ({
          osId: os.osId,
          insumoId: i.insumoId,
          qtdConsumida: i.qtdConsumida,
          valor: i.valorUnitario.paraNumero(),
        })),
      });
    }

    for (const t of os.transicoesPendentes) {
      await cliente.historicoStatusOrdemServico.create({
        data: {
          osId: os.osId,
          statusAnterior: t.statusAnterior,
          statusNovo: t.statusNovo,
          usuarioId: t.usuarioId,
        },
      });
    }
  }

  async tempoMedioExecucaoMs(): Promise<number> {
    // Tempo médio (ms) entre a entrada em `em_execucao` e o marco `finalizada`,
    // apurado pelo histórico. Aceita apenas OS que têm ambos os marcos.
    const result = await this.ctx.cliente().$queryRaw<Array<{ media: number | null }>>`
      SELECT AVG(EXTRACT(EPOCH FROM (fim.t - exec.t)) * 1000) AS media
      FROM (
        SELECT os_id, MIN(criado_em) AS t
        FROM historico_status_os
        WHERE status_novo = 'em_execucao'
        GROUP BY os_id
      ) exec
      JOIN (
        SELECT os_id, MIN(criado_em) AS t
        FROM historico_status_os
        WHERE status_novo = 'finalizada'
        GROUP BY os_id
      ) fim ON fim.os_id = exec.os_id
      JOIN ordem_servico o ON o.os_id = exec.os_id AND o.deletado_em IS NULL
    `;
    const media = result[0]?.media;
    return media ? Number(media) : 0;
  }
}
