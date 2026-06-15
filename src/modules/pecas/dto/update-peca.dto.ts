import { PartialType } from '@nestjs/swagger';
import { CreatePecaDto } from './create-peca.dto';

export class UpdatePecaDto extends PartialType(CreatePecaDto) {}
