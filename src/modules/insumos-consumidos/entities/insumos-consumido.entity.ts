import { ApiProperty } from '@nestjs/swagger';

export class InsumosConsumido {
  @ApiProperty()
  osId: string;

  @ApiProperty()
  insumoId: number;

  @ApiProperty()
  qtdConsumida: number;

  @ApiProperty()
  valor: number;
}
