import { PartialType } from '@nestjs/swagger';
import { CreateServicosRealizadosDto } from './create-servicos-realizado.dto';

export class UpdateServicosRealizadosDto extends PartialType(
  CreateServicosRealizadosDto,
) {}
