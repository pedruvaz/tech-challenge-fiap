import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVeiculoDto {
  @ApiProperty({ example: 'ABC1D23' })
  @IsString()
  @IsNotEmpty()
  placa: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty()
  marca: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @IsNotEmpty()
  modelo: string;

  @ApiProperty({ example: '2020' })
  @IsString()
  @IsNotEmpty()
  ano: string;

  @ApiProperty({ example: 'Preto' })
  @IsString()
  @IsNotEmpty()
  cor: string;
}
