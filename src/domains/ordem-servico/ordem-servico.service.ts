import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
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
  em_diagnostico: null, // transição para aguardando_aprovacao só via POST /aprovacao/:osId/solicitar
  aguardando_aprovacao: 'em_execucao',
  em_execucao: 'finalizada',
  finalizada: 'entregue',
  entregue: null,
  rejeitada: null,
};

// Status em que a OS já está concluída e seus itens não podem mais ser alterados.
const STATUS_BLOQUEADOS_PARA_ITENS: Status[] = ['finalizada', 'entregue'];

@Injectable()
export class OrdemServicoService {
  constructor(
    private readonly repository: OrdemServicoRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateOrdemServicoDto): Promise<OrdemServicoResponseDto> {
    const mecanico = await this.prisma.usuario.findFirst({
      where: { idUsuario: dto.mecanicoId, deletadoEm: null },
    });
    if (!mecanico) {
      throw new NotFoundException(
        `Mecânico '${dto.mecanicoId}' não encontrado`,
      );
    }

    const cliente = await this.prisma.cliente.findFirst({
      where: { clienteId: dto.clienteId, deletadoEm: null },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente '${dto.clienteId}' não encontrado`);
    }

    const veiculo = await this.prisma.veiculo.findFirst({
      where: { veiculoId: dto.veiculoId, deletadoEm: null },
    });
    if (!veiculo) {
      throw new NotFoundException(`Veículo '${dto.veiculoId}' não encontrado`);
    }

    const vinculo = await this.prisma.veiculoCliente.findUnique({
      where: {
        veiculoId_clienteId: {
          veiculoId: dto.veiculoId,
          clienteId: dto.clienteId,
        },
      },
    });
    if (!vinculo) {
      throw new BadRequestException(
        `O veículo '${dto.veiculoId}' não pertence ao cliente '${dto.clienteId}'`,
      );
    }

    const os = await this.prisma.$transaction(async (tx) => {
      const created = await this.repository.create(
        {
          usuarioId: dto.mecanicoId,
          clienteId: dto.clienteId,
          veiculoId: dto.veiculoId,
        },
        tx,
      );
      // Marco inicial do histórico: nascimento da OS em `recebida`.
      await this.repository.registrarTransicao(tx, {
        osId: created.osId,
        statusAnterior: null,
        statusNovo: 'recebida',
        usuarioId: dto.mecanicoId,
      });
      return created;
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

  // Consulta pública usada pelo cliente para acompanhar a OS sem JWT admin.
  // A autenticação efetiva é provar a posse do numDocumento (CPF/CNPJ) do dono.
  async findByIdParaCliente(
    osId: string,
    numDocumento: string,
  ): Promise<OrdemServicoResponseDto> {
    const os = await this.repository.findById(osId);
    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }
    const docInformado = numDocumento.replace(/\D/g, '');
    const docDono = os.cliente?.numDocumento.replace(/\D/g, '');
    if (!docDono || docDono !== docInformado) {
      throw new ForbiddenException(
        'O documento informado não confere com o dono desta ordem de serviço',
      );
    }
    return new OrdemServicoResponseDto(os);
  }

  async updateStatus(
    osId: string,
    dto: UpdateStatusDto,
    usuarioId?: number,
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

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await this.repository.updateStatus(osId, dto.status, tx);
      await this.repository.registrarTransicao(tx, {
        osId,
        statusAnterior: os.status,
        statusNovo: dto.status,
        usuarioId,
      });
      return result;
    });
    return new OrdemServicoResponseDto(updated);
  }

  async aprovarOrcamento(
    osId: string,
    usuarioId?: number,
  ): Promise<OrdemServicoResponseDto> {
    const os = await this.repository.findById(osId);
    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }
    if (os.status !== 'aguardando_aprovacao') {
      throw new BadRequestException(
        `Só é possível aprovar o orçamento quando o status é 'aguardando_aprovacao'. Status atual: '${os.status}'`,
      );
    }
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await this.repository.updateStatus(
        osId,
        'em_execucao',
        tx,
      );
      await this.repository.registrarTransicao(tx, {
        osId,
        statusAnterior: os.status,
        statusNovo: 'em_execucao',
        usuarioId,
      });
      return result;
    });
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
    this.assertItensEditaveis(os.status);

    const servico = await this.prisma.servico.findUnique({
      where: { servicoId: dto.servicoId },
    });
    if (!servico) {
      throw new NotFoundException(`Serviço '${dto.servicoId}' não encontrado`);
    }

    await this.prisma.$transaction(async (tx) => {
      // `valor` guarda o valor histórico UNITÁRIO; o total da linha é valor × quantidade.
      await tx.servicoRealizado.upsert({
        where: { osId_servicoId: { osId, servicoId: dto.servicoId } },
        create: {
          osId,
          servicoId: dto.servicoId,
          quantidade: dto.quantidade,
          valor: servico.valor,
        },
        update: { quantidade: dto.quantidade, valor: servico.valor },
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
    this.assertItensEditaveis(os.status);

    const servicoRealizado = await this.repository.findServicoRealizado(
      osId,
      servicoId,
    );
    if (!servicoRealizado) {
      throw new NotFoundException(
        `Serviço '${servicoId}' não encontrado na ordem de serviço '${osId}'`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.servicoRealizado.delete({
        where: { osId_servicoId: { osId, servicoId } },
      });
      await this.recalcularValorFinal(osId, tx);
    });

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
    this.assertItensEditaveis(os.status);

    const peca = await this.prisma.peca.findUnique({
      where: { pecaId: dto.pecaId },
    });
    if (!peca) {
      throw new NotFoundException(`Peça '${dto.pecaId}' não encontrada`);
    }

    await this.prisma.$transaction(async (tx) => {
      const existente = await tx.pecaUtilizada.findUnique({
        where: { osId_pecaId: { osId, pecaId: dto.pecaId } },
      });
      // Ajusta o estoque apenas pela diferença entre a nova quantidade e a já registrada.
      const delta = dto.qtd - (existente?.qtd ?? 0);
      if (delta > 0 && peca.qtdEstoque < delta) {
        throw new BadRequestException(
          `Estoque insuficiente para a peça '${peca.nome}'. Disponível: ${peca.qtdEstoque}, necessário: ${delta}`,
        );
      }
      if (delta !== 0) {
        await tx.peca.update({
          where: { pecaId: dto.pecaId },
          data: { qtdEstoque: { decrement: delta } },
        });
      }
      await tx.pecaUtilizada.upsert({
        where: { osId_pecaId: { osId, pecaId: dto.pecaId } },
        create: { osId, pecaId: dto.pecaId, qtd: dto.qtd, valor: peca.valorUn },
        update: { qtd: dto.qtd, valor: peca.valorUn },
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
    this.assertItensEditaveis(os.status);

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
    this.assertItensEditaveis(os.status);

    const insumo = await this.prisma.insumo.findUnique({
      where: { insumoId: dto.insumoId },
    });
    if (!insumo) {
      throw new NotFoundException(`Insumo '${dto.insumoId}' não encontrado`);
    }

    await this.prisma.$transaction(async (tx) => {
      const existente = await tx.insumoConsumido.findUnique({
        where: { osId_insumoId: { osId, insumoId: dto.insumoId } },
      });
      const delta = dto.qtdConsumida - (existente?.qtdConsumida ?? 0);
      if (delta > 0 && insumo.qtdEstoque < delta) {
        throw new BadRequestException(
          `Estoque insuficiente para o insumo '${insumo.nome}'. Disponível: ${insumo.qtdEstoque}, necessário: ${delta}`,
        );
      }
      if (delta !== 0) {
        await tx.insumo.update({
          where: { insumoId: dto.insumoId },
          data: { qtdEstoque: { decrement: delta } },
        });
      }
      await tx.insumoConsumido.upsert({
        where: { osId_insumoId: { osId, insumoId: dto.insumoId } },
        create: {
          osId,
          insumoId: dto.insumoId,
          qtdConsumida: dto.qtdConsumida,
          valor: insumo.valorUn,
        },
        update: { qtdConsumida: dto.qtdConsumida, valor: insumo.valorUn },
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
    this.assertItensEditaveis(os.status);

    const insumoConsumido = await this.repository.findInsumoConsumido(
      osId,
      insumoId,
    );
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

  private assertItensEditaveis(status: Status): void {
    if (STATUS_BLOQUEADOS_PARA_ITENS.includes(status)) {
      throw new BadRequestException(
        `Não é possível alterar os itens de uma OS com status '${status}'`,
      );
    }
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

    // Aritmética monetária com Decimal para evitar erros de ponto flutuante.
    const zero = new Prisma.Decimal(0);

    const totalServicos = os.servicosRealizados.reduce(
      (acc, sr) => acc.plus(new Prisma.Decimal(sr.valor).times(sr.quantidade)),
      zero,
    );

    const totalPecas = os.pecasUtilizadas.reduce(
      (acc, pu) => acc.plus(new Prisma.Decimal(pu.valor).times(pu.qtd)),
      zero,
    );

    const totalInsumos = os.insumosConsumidos.reduce(
      (acc, ic) =>
        acc.plus(new Prisma.Decimal(ic.valor).times(ic.qtdConsumida)),
      zero,
    );

    const valorFinal = totalServicos.plus(totalPecas).plus(totalInsumos);

    await client.ordemServico.update({
      where: { osId },
      data: { valorFinal },
    });
  }
}
