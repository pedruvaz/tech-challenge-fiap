import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AdicionarServicoRequest {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  servicoId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantidade: number;
}
