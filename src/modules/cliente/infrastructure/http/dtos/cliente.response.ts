import { ApiProperty } from '@nestjs/swagger';
import { Tipo } from '@prisma/client';

export class VeiculoDoClienteDto {
  @ApiProperty() veiculoId: string;
  @ApiProperty() placa: string;
  @ApiProperty() marca: string;
  @ApiProperty() modelo: string;
  @ApiProperty() ano: string;
  @ApiProperty() cor: string;
  @ApiProperty() criadoEm: Date;
  @ApiProperty() atualizadoEm: Date;
  @ApiProperty({ nullable: true }) deletadoEm: Date | null;
}

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

  @ApiProperty() criadoEm: Date;
  @ApiProperty() atualizadoEm: Date;

  @ApiProperty({ type: VeiculoDoClienteDto, isArray: true })
  veiculos: VeiculoDoClienteDto[];
}
