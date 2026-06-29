import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
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

  @ApiProperty({
    description: 'ID do cliente proprietário do veículo',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsUUID()
  clienteId: string;

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
