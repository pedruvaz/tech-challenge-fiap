import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AddInsumoDto } from './dto/add-insumo.dto';
import { AddPecaDto } from './dto/add-peca.dto';
import { AddServicoDto } from './dto/add-servico.dto';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { OrdemServicoResponseDto } from './dto/ordem-servico-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { OrdemServicoRepository } from './ordem-servico.repository';

const TRANSICOES_VALIDAS: Record<Status, Status | null> = {
  recebida: 'em_diagnostico',
  em_diagnostico: 'aguardando_aprovacao',
  aguardando_aprovacao: 'em_execucao',
  em_execucao: 'finalizada',
  finalizada: 'entregue',
  entregue: null,
};

@Injectable()
export class OrdemServicoService {
  constructor(
    private readonly repository: OrdemServicoRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateOrdemServicoDto): Promise<OrdemServicoResponseDto> {
    const os = await this.repository.create({
      usuarioId: dto.mecanicoId,
      clienteId: dto.clienteId,
      veiculoId: dto.veiculoId,
    });
    return new OrdemServicoResponseDto(os);
  }

  async findAll(filters?: {
    status?: Status;
    clienteId?: string;
  }): Promise<OrdemServicoResponseDto[]> {
    const list = await this.repository.findAll(filters);
    return list.map((os) => new OrdemServicoResponseDto(os));
  }

  async findById(osId: string): Promise<OrdemServicoResponseDto> {
    const os = await this.repository.findById(osId);
    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }
    return new OrdemServicoResponseDto(os);
  }

  async updateStatus(
    osId: string,
    dto: UpdateStatusDto,
  ): Promise<OrdemServicoResponseDto> {
    const os = await this.repository.findById(osId);
    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }

    const proximoValido = TRANSICOES_VALIDAS[os.status];
    if (dto.status !== proximoValido) {
      if (proximoValido === null) {
        throw new BadRequestException(
          `Status atual é '${os.status}'. Não há transição possível a partir deste status`,
        );
      }
      throw new BadRequestException(
        `Status atual é '${os.status}'. Só é possível avançar para '${proximoValido}'`,
      );
    }

    const updated = await this.repository.updateStatus(osId, dto.status);
    return new OrdemServicoResponseDto(updated);
  }

  async remove(osId: string): Promise<void> {
    const os = await this.repository.findById(osId);
    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }
    await this.repository.softDelete(osId);
  }

  async addServico(
    osId: string,
    dto: AddServicoDto,
  ): Promise<OrdemServicoResponseDto> {
    const os = await this.repository.findById(osId);
    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }

    const servico = await this.prisma.servico.findUnique({
      where: { servicoId: dto.servicoId },
    });
    if (!servico) {
      throw new NotFoundException(`Serviço '${dto.servicoId}' não encontrado`);
    }

    const valor = Number(servico.valor) * dto.quantidade;

    await this.prisma.$transaction(async (tx) => {
      await tx.servicoRealizado.upsert({
        where: { osId_servicoId: { osId, servicoId: dto.servicoId } },
        create: { osId, servicoId: dto.servicoId, quantidade: dto.quantidade, valor },
        update: { quantidade: dto.quantidade, valor },
      });
      await this.recalcularValorFinal(osId, tx);
    });

    return this.findById(osId);
  }

  async removeServico(
    osId: string,
    servicoId: number,
  ): Promise<OrdemServicoResponseDto> {
    const os = await this.repository.findById(osId);
    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }

    await this.repository.removeServico(osId, servicoId);
    await this.recalcularValorFinal(osId);
    return this.findById(osId);
  }

  async addPeca(
    osId: string,
    dto: AddPecaDto,
  ): Promise<OrdemServicoResponseDto> {
    const os = await this.repository.findById(osId);
    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }

    const peca = await this.prisma.peca.findUnique({
      where: { pecaId: dto.pecaId },
    });
    if (!peca) {
      throw new NotFoundException(`Peça '${dto.pecaId}' não encontrada`);
    }

    if (peca.qtdEstoque < dto.qtd) {
      throw new BadRequestException(
        `Estoque insuficiente para a peça '${peca.nome}'. Disponível: ${peca.qtdEstoque}, solicitado: ${dto.qtd}`,
      );
    }

    const valor = Number(peca.valorUn) * dto.qtd;

    await this.prisma.$transaction(async (tx) => {
      await tx.peca.update({
        where: { pecaId: dto.pecaId },
        data: { qtdEstoque: { decrement: dto.qtd } },
      });
      await tx.pecaUtilizada.upsert({
        where: { osId_pecaId: { osId, pecaId: dto.pecaId } },
        create: { osId, pecaId: dto.pecaId, qtd: dto.qtd, valor },
        update: { qtd: dto.qtd, valor },
      });
      await this.recalcularValorFinal(osId, tx);
    });

    return this.findById(osId);
  }

  async removePeca(
    osId: string,
    pecaId: number,
  ): Promise<OrdemServicoResponseDto> {
    const os = await this.repository.findById(osId);
    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }

    const pecaUtilizada = await this.repository.findPecaUtilizada(osId, pecaId);
    if (!pecaUtilizada) {
      throw new NotFoundException(
        `Peça '${pecaId}' não encontrada na ordem de serviço '${osId}'`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.peca.update({
        where: { pecaId },
        data: { qtdEstoque: { increment: pecaUtilizada.qtd } },
      });
      await tx.pecaUtilizada.delete({
        where: { osId_pecaId: { osId, pecaId } },
      });
      await this.recalcularValorFinal(osId, tx);
    });

    return this.findById(osId);
  }

  async addInsumo(
    osId: string,
    dto: AddInsumoDto,
  ): Promise<OrdemServicoResponseDto> {
    const os = await this.repository.findById(osId);
    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }

    const insumo = await this.prisma.insumo.findUnique({
      where: { insumoId: dto.insumoId },
    });
    if (!insumo) {
      throw new NotFoundException(`Insumo '${dto.insumoId}' não encontrado`);
    }

    if (insumo.qtdEstoque < dto.qtdConsumida) {
      throw new BadRequestException(
        `Estoque insuficiente para o insumo '${insumo.nome}'. Disponível: ${insumo.qtdEstoque}, solicitado: ${dto.qtdConsumida}`,
      );
    }

    const valor = Number(insumo.valorUn) * dto.qtdConsumida;

    await this.prisma.$transaction(async (tx) => {
      await tx.insumo.update({
        where: { insumoId: dto.insumoId },
        data: { qtdEstoque: { decrement: dto.qtdConsumida } },
      });
      await tx.insumoConsumido.upsert({
        where: { osId_insumoId: { osId, insumoId: dto.insumoId } },
        create: { osId, insumoId: dto.insumoId, qtdConsumida: dto.qtdConsumida, valor },
        update: { qtdConsumida: dto.qtdConsumida, valor },
      });
      await this.recalcularValorFinal(osId, tx);
    });

    return this.findById(osId);
  }

  async removeInsumo(
    osId: string,
    insumoId: number,
  ): Promise<OrdemServicoResponseDto> {
    const os = await this.repository.findById(osId);
    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }

    const insumoConsumido = await this.repository.findInsumoConsumido(osId, insumoId);
    if (!insumoConsumido) {
      throw new NotFoundException(
        `Insumo '${insumoId}' não encontrado na ordem de serviço '${osId}'`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.insumo.update({
        where: { insumoId },
        data: { qtdEstoque: { increment: insumoConsumido.qtdConsumida } },
      });
      await tx.insumoConsumido.delete({
        where: { osId_insumoId: { osId, insumoId } },
      });
      await this.recalcularValorFinal(osId, tx);
    });

    return this.findById(osId);
  }

  async getTempoMedio(): Promise<{
    tempoMedioMs: number;
    tempoMedioMinutos: number;
    tempoMedioHoras: number;
  }> {
    const tempoMedioMs = await this.repository.tempoMedioExecucaoMs();
    return {
      tempoMedioMs,
      tempoMedioMinutos: tempoMedioMs / 60000,
      tempoMedioHoras: tempoMedioMs / 3600000,
    };
  }

  private async recalcularValorFinal(
    osId: string,
    prismaClient?: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
  ): Promise<void> {
    const client = prismaClient ?? this.prisma;

    const os = await client.ordemServico.findUnique({
      where: { osId },
      include: {
        servicosRealizados: true,
        pecasUtilizadas: true,
        insumosConsumidos: true,
      },
    });

    if (!os) return;

    const totalServicos = os.servicosRealizados.reduce(
      (acc, sr) => acc + Number(sr.valor) * sr.quantidade,
      0,
    );

    const totalPecas = os.pecasUtilizadas.reduce(
      (acc, pu) => acc + Number(pu.valor) * pu.qtd,
      0,
    );

    const totalInsumos = os.insumosConsumidos.reduce(
      (acc, ic) => acc + Number(ic.valor) * ic.qtdConsumida,
      0,
    );

    const valorFinal = totalServicos + totalPecas + totalInsumos;

    await client.ordemServico.update({
      where: { osId },
      data: { valorFinal },
    });
  }
}
