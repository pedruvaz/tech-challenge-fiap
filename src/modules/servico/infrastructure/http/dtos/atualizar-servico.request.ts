import { PartialType } from '@nestjs/swagger';
import { CriarServicoRequest } from './criar-servico.request';

export class AtualizarServicoRequest extends PartialType(CriarServicoRequest) {}
