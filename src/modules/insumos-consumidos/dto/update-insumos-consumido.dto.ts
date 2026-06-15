import { PartialType } from '@nestjs/swagger';
import { CreateInsumosConsumidoDto } from './create-insumos-consumido.dto';

export class UpdateInsumosConsumidoDto extends PartialType(CreateInsumosConsumidoDto) {}
