import { Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdemServicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { usuarioId: number; clienteId: string; veiculoId: string }) {
    return this.prisma.ordemServico.create({
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

  updateStatus(osId: string, status: Status) {
    return this.prisma.ordemServico.update({
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

  async tempoMedioExecucaoMs(): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ media: number | null }>>`
      SELECT AVG(EXTRACT(EPOCH FROM (atualizado_em - criado_em)) * 1000) as media
      FROM ordem_servico
      WHERE status IN ('finalizada', 'entregue')
      AND deletado_em IS NULL
    `;

    const media = result[0]?.media;
    return media ? Number(media) : 0;
  }
}
