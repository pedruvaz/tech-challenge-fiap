import { ApiProperty } from '@nestjs/swagger';
import { Cliente, Tipo, Veiculo } from '@prisma/client';
import { VeiculoResponseDto } from '../../veiculo/dto/veiculo-response.dto';

type ClienteComVeiculos = Cliente & {
  veiculos?: { veiculo: Veiculo }[];
};

export class ClienteResponseDto {
  @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
  clienteId: string;

  @ApiProperty({ example: '111.444.777-35' })
  numDocumento: string;

  @ApiProperty({ example: 'João da Silva' })
  nome: string;

  @ApiProperty({ example: '11999998888' })
  telefone: string;

  @ApiProperty({ enum: Tipo, example: Tipo.pessoa_fisica })
  tipo: Tipo;

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty()
  atualizadoEm: Date;

  @ApiProperty({ type: VeiculoResponseDto, isArray: true })
  veiculos: VeiculoResponseDto[];

  constructor(cliente: ClienteComVeiculos) {
    this.clienteId = cliente.clienteId;
    this.numDocumento = cliente.numDocumento;
    this.nome = cliente.nome;
    this.telefone = cliente.telefone;
    this.tipo = cliente.tipo;
    this.criadoEm = cliente.criadoEm;
    this.atualizadoEm = cliente.atualizadoEm;
    this.veiculos = (cliente.veiculos ?? []).map(
      (vinculo) => new VeiculoResponseDto(vinculo.veiculo),
    );
  }
}
