import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AdicionarInsumoRequest {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  insumoId: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  qtdConsumida: number;
}
