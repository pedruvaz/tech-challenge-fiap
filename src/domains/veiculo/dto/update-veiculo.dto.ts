import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateVeiculoDto } from './create-veiculo.dto';

// O vínculo veículo↔cliente é definido apenas na criação; não se altera por PATCH.
export class UpdateVeiculoDto extends PartialType(
  OmitType(CreateVeiculoDto, ['clienteId'] as const),
) {}
