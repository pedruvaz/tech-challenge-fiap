import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class ServicoRealizadoResponseDto {
  @ApiProperty() servicoId: number;
  @ApiProperty() descricao: string;
  @ApiProperty() quantidade: number;
  @ApiProperty() valor: number;
}

export class PecaUtilizadaResponseDto {
  @ApiProperty() pecaId: number;
  @ApiProperty() nome: string;
  @ApiProperty() qtd: number;
  @ApiProperty() valor: number;
}

export class InsumoConsumidoResponseDto {
  @ApiProperty() insumoId: number;
  @ApiProperty() nome: string;
  @ApiProperty() qtdConsumida: number;
  @ApiProperty() valor: number;
}

export class MecanicoResumoDto {
  @ApiProperty() idUsuario: number;
  @ApiProperty() nome: string;
}

export class ClienteResumoDto {
  @ApiProperty() clienteId: string;
  @ApiProperty() nome: string;
  @ApiProperty() numDocumento: string;
}

export class VeiculoResumoDto {
  @ApiProperty() veiculoId: string;
  @ApiProperty() placa: string;
  @ApiProperty() marca: string;
  @ApiProperty() modelo: string;
}

export class OrdemServicoResponseDto {
  @ApiProperty() osId: string;
  @ApiProperty() usuarioId: number;
  @ApiProperty() clienteId: string;
  @ApiProperty() veiculoId: string;
  @ApiProperty({ enum: Status }) status: Status;
  @ApiProperty() valorFinal: number;
  @ApiProperty() criadoEm: Date;
  @ApiProperty() atualizadoEm: Date;
  @ApiProperty({ nullable: true }) deletadoEm: Date | null;
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
}
