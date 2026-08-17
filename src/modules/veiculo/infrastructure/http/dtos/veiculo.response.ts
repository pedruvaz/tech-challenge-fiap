import { ApiProperty } from '@nestjs/swagger';

export class VeiculoResponseDto {
  @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
  veiculoId: string;

  @ApiProperty({ example: 'ABC1D23' })
  placa: string;

  @ApiProperty({ example: 'Toyota' })
  marca: string;

  @ApiProperty({ example: 'Corolla' })
  modelo: string;

  @ApiProperty({ example: '2020' })
  ano: string;

  @ApiProperty({ example: 'Preto' })
  cor: string;

  @ApiProperty() criadoEm: Date;
  @ApiProperty() atualizadoEm: Date;
}
