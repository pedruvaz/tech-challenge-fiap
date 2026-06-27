import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateOrdemServicoDto {
  @ApiProperty({ example: 1, description: 'ID do mecânico responsável' })
  @IsInt()
  @Min(1)
  mecanicoId: number;

  @ApiProperty({ example: 'uuid-do-cliente' })
  @IsUUID()
  clienteId: string;

  @ApiProperty({ example: 'uuid-do-veiculo' })
  @IsUUID()
  veiculoId: string;
}
