import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddPecaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  pecaId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  qtd: number;
}
