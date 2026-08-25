import { OmitType, PartialType } from '@nestjs/swagger';
import { CriarVeiculoRequest } from './criar-veiculo.request';

// O vínculo veículo↔cliente é definido apenas na criação; não se altera por PATCH.
export class AtualizarVeiculoRequest extends PartialType(
  OmitType(CriarVeiculoRequest, ['clienteId'] as const),
) {}
