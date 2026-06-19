import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class ServicoRealizadoResponseDto {
  @ApiProperty()
  servicoId: number;

  @ApiProperty()
  descricao: string;

  @ApiProperty()
  quantidade: number;

  @ApiProperty()
  valor: number;
}

export class PecaUtilizadaResponseDto {
  @ApiProperty()
  pecaId: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  qtd: number;

  @ApiProperty()
  valor: number;
}

export class InsumoConsumidoResponseDto {
  @ApiProperty()
  insumoId: number;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  qtdConsumida: number;

  @ApiProperty()
  valor: number;
}

export class MecanicoResumoDto {
  @ApiProperty()
  idUsuario: number;

  @ApiProperty()
  nome: string;
}

export class ClienteResumoDto {
  @ApiProperty()
  clienteId: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  numDocumento: string;
}

export class VeiculoResumoDto {
  @ApiProperty()
  veiculoId: string;

  @ApiProperty()
  placa: string;

  @ApiProperty()
  marca: string;

  @ApiProperty()
  modelo: string;
}

export class OrdemServicoResponseDto {
  @ApiProperty()
  osId: string;

  @ApiProperty()
  usuarioId: number;

  @ApiProperty()
  clienteId: string;

  @ApiProperty()
  veiculoId: string;

  @ApiProperty({ enum: Status })
  status: Status;

  @ApiProperty()
  valorFinal: number;

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty()
  atualizadoEm: Date;

  @ApiProperty({ nullable: true })
  deletadoEm: Date | null;

  @ApiProperty({ type: () => MecanicoResumoDto, nullable: true })
  mecanico?: MecanicoResumoDto;

  @ApiProperty({ type: () => ClienteResumoDto, nullable: true })
  cliente?: ClienteResumoDto;

  @ApiProperty({ type: () => VeiculoResumoDto, nullable: true })
  veiculo?: VeiculoResumoDto;

  @ApiProperty({ type: () => [ServicoRealizadoResponseDto] })
  servicosRealizados?: ServicoRealizadoResponseDto[];

  @ApiProperty({ type: () => [PecaUtilizadaResponseDto] })
  pecasUtilizadas?: PecaUtilizadaResponseDto[];

  @ApiProperty({ type: () => [InsumoConsumidoResponseDto] })
  insumosConsumidos?: InsumoConsumidoResponseDto[];

  constructor(os: {
    osId: string;
    usuarioId: number;
    clienteId: string;
    veiculoId: string;
    status: Status;
    valorFinal: { toNumber?: () => number } | number;
    criadoEm: Date;
    atualizadoEm: Date;
    deletadoEm?: Date | null;
    mecanico?: { idUsuario: number; nome: string } | null;
    cliente?: { clienteId: string; nome: string; numDocumento: string } | null;
    veiculo?: { veiculoId: string; placa: string; marca: string; modelo: string } | null;
    servicosRealizados?: Array<{
      servicoId: number;
      quantidade: number;
      valor: { toNumber?: () => number } | number;
      servico?: { descricao: string } | null;
    }>;
    pecasUtilizadas?: Array<{
      pecaId: number;
      qtd: number;
      valor: { toNumber?: () => number } | number;
      peca?: { nome: string } | null;
    }>;
    insumosConsumidos?: Array<{
      insumoId: number;
      qtdConsumida: number;
      valor: { toNumber?: () => number } | number;
      insumo?: { nome: string } | null;
    }>;
  }) {
    this.osId = os.osId;
    this.usuarioId = os.usuarioId;
    this.clienteId = os.clienteId;
    this.veiculoId = os.veiculoId;
    this.status = os.status;
    this.valorFinal = typeof os.valorFinal === 'number' ? os.valorFinal : Number(os.valorFinal);
    this.criadoEm = os.criadoEm;
    this.atualizadoEm = os.atualizadoEm;
    this.deletadoEm = os.deletadoEm ?? null;

    if (os.mecanico) {
      this.mecanico = { idUsuario: os.mecanico.idUsuario, nome: os.mecanico.nome };
    }

    if (os.cliente) {
      this.cliente = {
        clienteId: os.cliente.clienteId,
        nome: os.cliente.nome,
        numDocumento: os.cliente.numDocumento,
      };
    }

    if (os.veiculo) {
      this.veiculo = {
        veiculoId: os.veiculo.veiculoId,
        placa: os.veiculo.placa,
        marca: os.veiculo.marca,
        modelo: os.veiculo.modelo,
      };
    }

    if (os.servicosRealizados) {
      this.servicosRealizados = os.servicosRealizados.map((sr) => ({
        servicoId: sr.servicoId,
        descricao: sr.servico?.descricao ?? '',
        quantidade: sr.quantidade,
        valor: typeof sr.valor === 'number' ? sr.valor : Number(sr.valor),
      }));
    }

    if (os.pecasUtilizadas) {
      this.pecasUtilizadas = os.pecasUtilizadas.map((pu) => ({
        pecaId: pu.pecaId,
        nome: pu.peca?.nome ?? '',
        qtd: pu.qtd,
        valor: typeof pu.valor === 'number' ? pu.valor : Number(pu.valor),
      }));
    }

    if (os.insumosConsumidos) {
      this.insumosConsumidos = os.insumosConsumidos.map((ic) => ({
        insumoId: ic.insumoId,
        nome: ic.insumo?.nome ?? '',
        qtdConsumida: ic.qtdConsumida,
        valor: typeof ic.valor === 'number' ? ic.valor : Number(ic.valor),
      }));
    }
  }
}
