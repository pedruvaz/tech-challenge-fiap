import { PartialType } from '@nestjs/swagger';
import { CriarInsumoRequest } from './criar-insumo.request';

export class AtualizarInsumoRequest extends PartialType(CriarInsumoRequest) {}
