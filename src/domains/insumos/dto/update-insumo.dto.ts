import { PartialType } from '@nestjs/swagger';
import { CreateInsumoDto } from './create-insumo.dto';

export class UpdateInsumoDto extends PartialType(CreateInsumoDto) {}
