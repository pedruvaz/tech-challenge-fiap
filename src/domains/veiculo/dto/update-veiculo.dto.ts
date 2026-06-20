import { PartialType } from '@nestjs/swagger';
import { CreateVeiculoDto } from './create-veiculo.dto';

export class UpdateVeiculoDto extends PartialType(CreateVeiculoDto) {}
