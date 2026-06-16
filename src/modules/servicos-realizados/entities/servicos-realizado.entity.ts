import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ServicosRealizado {
  @ApiProperty({
    example: 'OS001',
    description: 'ID da ordem de serviço',
  })
  @IsString()
  @IsNotEmpty()
  osId: string;

  @ApiProperty({
    example: 1,
    description: 'ID do insumo consumido',
  })
  @IsInt()
  @Min(1)
  servicoId: number;
}
