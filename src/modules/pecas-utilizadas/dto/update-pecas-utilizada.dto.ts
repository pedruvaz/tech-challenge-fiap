import { PartialType } from '@nestjs/swagger';
import { CreatePecasUtilizadaDto } from './create-pecas-utilizada.dto';

export class UpdatePecasUtilizadaDto extends PartialType(CreatePecasUtilizadaDto) {}
