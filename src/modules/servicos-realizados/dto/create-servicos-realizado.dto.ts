import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateServicosRealizadosDto {
  @ApiProperty({
    example: 'OS001',
    description: 'ID da ordem de serviço',
  })
  @IsString()
  @IsNotEmpty()
  osId: string;

  @ApiProperty({
    example: 1,
    description: 'ID do serviço realizado',
  })
  @IsInt()
  @Min(1)
  servicoId: number;

  @ApiProperty({
    example: 1,
    description: 'Quantidade de vezes que o serviço foi realizado',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantidade?: number;

  @ApiProperty({
    example: 150.5,
    description: 'Valor do serviço realizado',
  })
  @IsNumber()
  @Min(0)
  valor: number;
}
