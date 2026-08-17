import { PartialType } from '@nestjs/swagger';
import { CriarUsuarioRequest } from './criar-usuario.request';

export class AtualizarUsuarioRequest extends PartialType(CriarUsuarioRequest) {}
