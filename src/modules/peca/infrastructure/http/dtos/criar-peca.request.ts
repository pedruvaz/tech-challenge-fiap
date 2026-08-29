import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CriarPecaRequest {
  @ApiProperty({ example: 'Motor', description: 'Nome da peça' })
  @IsString()
  @MinLength(2, { message: 'O nome deve conter no mínimo 2 caracteres.' })
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 10, description: 'Quantidade disponível em estoque' })
  @IsNumber()
  @Min(0)
  qtdEstoque: number;

  @ApiProperty({ example: 49.9, description: 'Valor unitário da peça' })
  @IsNumber()
  @Min(0)
  valorUn: number;
}
