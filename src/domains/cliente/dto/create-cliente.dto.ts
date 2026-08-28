import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Tipo } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsCpfCnpj } from '../../../common/validators/cpf-cnpj.validator';

export class CreateClienteDto {
  @ApiProperty({
    description:
      'CPF (pessoa_fisica) ou CNPJ (pessoa_juridica), com ou sem máscara',
    example: '111.444.777-35',
  })
  @IsString()
  @IsNotEmpty()
  @IsCpfCnpj()
  numDocumento: string;

  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiPropertyOptional({ example: 'joao@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '11999998888' })
  @IsString()
  @IsNotEmpty()
  telefone: string;

  @ApiProperty({ enum: Tipo, example: Tipo.pessoa_fisica })
  @IsEnum(Tipo)
  @IsNotEmpty()
  tipo: Tipo;
}
