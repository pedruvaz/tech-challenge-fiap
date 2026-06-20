import { ApiProperty } from '@nestjs/swagger';
import { Tipo } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({ example: '12345678900' })
  @IsString()
  @IsNotEmpty()
  numDocumento: string;

  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: '11999998888' })
  @IsString()
  @IsNotEmpty()
  telefone: string;

  @ApiProperty({ enum: Tipo, example: Tipo.pessoa_fisica })
  @IsEnum(Tipo)
  @IsNotEmpty()
  tipo: Tipo;
}
