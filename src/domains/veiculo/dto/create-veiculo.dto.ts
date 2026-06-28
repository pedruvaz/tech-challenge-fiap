import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsPlacaVeiculo } from '../../../common/validators/placa-veiculo.validator';

export class CreateVeiculoDto {
  @ApiProperty({
    description: 'Placa antiga (AAA-1234 / AAA1234) ou Mercosul (AAA1A23)',
    example: 'ABC1D23',
  })
  @IsString()
  @IsNotEmpty()
  @IsPlacaVeiculo()
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
