import { Injectable } from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Client Prisma que pode ser o serviço base ou um cliente transacional (`tx`).
type PrismaClientLike = PrismaService | Prisma.TransactionClient;

@Injectable()
export class OrdemServicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: { usuarioId: number; clienteId: string; veiculoId: string },
    client: PrismaClientLike = this.prisma,
  ) {
    return client.ordemServico.create({
      data: {
        usuarioId: data.usuarioId,
        clienteId: data.clienteId,
        veiculoId: data.veiculoId,
        status: 'recebida',
      },
      include: {
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
      },
    });
  }

  findAll(filters?: { status?: Status; clienteId?: string }) {
    return this.prisma.ordemServico.findMany({
      where: {
        deletadoEm: null,
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.clienteId ? { clienteId: filters.clienteId } : {}),
      },
      orderBy: [{ status: 'asc' }, { criadoEm: 'asc' }],
      include: {
        mecanico: { select: { idUsuario: true, nome: true } },
        cliente: {
          select: { clienteId: true, nome: true, numDocumento: true },
        },
        veiculo: {
          select: { veiculoId: true, placa: true, marca: true, modelo: true },
        },
      },
    });
  }

  findById(osId: string) {
    return this.prisma.ordemServico.findFirst({
      where: { osId, deletadoEm: null },
      include: {
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
      },
    });
  }

  updateStatus(
    osId: string,
    status: Status,
    client: PrismaClientLike = this.prisma,
  ) {
    return client.ordemServico.update({
      where: { osId },
      data: { status },
      include: {
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
      },
    });
  }

  updateValorFinal(osId: string, valorFinal: number) {
    return this.prisma.ordemServico.update({
      where: { osId },
      data: { valorFinal },
    });
  }

  softDelete(osId: string) {
    return this.prisma.ordemServico.update({
      where: { osId },
      data: { deletadoEm: new Date() },
    });
  }

  addServico(
    osId: string,
    servicoId: number,
    quantidade: number,
    valor: number,
  ) {
    return this.prisma.servicoRealizado.upsert({
      where: { osId_servicoId: { osId, servicoId } },
      create: { osId, servicoId, quantidade, valor },
      update: { quantidade, valor },
    });
  }

  removeServico(osId: string, servicoId: number) {
    return this.prisma.servicoRealizado.delete({
      where: { osId_servicoId: { osId, servicoId } },
    });
  }

  findServicoRealizado(osId: string, servicoId: number) {
    return this.prisma.servicoRealizado.findUnique({
      where: { osId_servicoId: { osId, servicoId } },
    });
  }

  addPeca(osId: string, pecaId: number, qtd: number, valor: number) {
    return this.prisma.pecaUtilizada.upsert({
      where: { osId_pecaId: { osId, pecaId } },
      create: { osId, pecaId, qtd, valor },
      update: { qtd, valor },
    });
  }

  removePeca(osId: string, pecaId: number) {
    return this.prisma.pecaUtilizada.delete({
      where: { osId_pecaId: { osId, pecaId } },
    });
  }

  findPecaUtilizada(osId: string, pecaId: number) {
    return this.prisma.pecaUtilizada.findUnique({
      where: { osId_pecaId: { osId, pecaId } },
    });
  }

  addInsumo(
    osId: string,
    insumoId: number,
    qtdConsumida: number,
    valor: number,
  ) {
    return this.prisma.insumoConsumido.upsert({
      where: { osId_insumoId: { osId, insumoId } },
      create: { osId, insumoId, qtdConsumida, valor },
      update: { qtdConsumida, valor },
    });
  }

  removeInsumo(osId: string, insumoId: number) {
    return this.prisma.insumoConsumido.delete({
      where: { osId_insumoId: { osId, insumoId } },
    });
  }

  findInsumoConsumido(osId: string, insumoId: number) {
    return this.prisma.insumoConsumido.findUnique({
      where: { osId_insumoId: { osId, insumoId } },
    });
  }

  // Registra uma transição de status no histórico. Aceita um cliente
  // transacional para gravar junto com a própria mudança de status.
  registrarTransicao(
    client: PrismaClientLike,
    data: {
      osId: string;
      statusAnterior: Status | null;
      statusNovo: Status;
      usuarioId?: number | null;
    },
  ) {
    return client.historicoStatusOrdemServico.create({
      data: {
        osId: data.osId,
        statusAnterior: data.statusAnterior,
        statusNovo: data.statusNovo,
        usuarioId: data.usuarioId ?? null,
      },
    });
  }

  // Tempo médio (ms) que as OS levam na etapa de execução: do momento em que
  // entram em `em_execucao` até atingirem `finalizada`. Calculado a partir do
  // histórico de status, considerando apenas OS que têm ambos os marcos.
  async tempoMedioExecucaoMs(): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ media: number | null }>>`
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
