import { PartialType } from '@nestjs/swagger';
import { CriarPecaRequest } from './criar-peca.request';

export class AtualizarPecaRequest extends PartialType(CriarPecaRequest) {}
