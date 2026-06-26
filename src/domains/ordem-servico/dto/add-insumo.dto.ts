import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddInsumoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  insumoId: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  qtdConsumida: number;
}
