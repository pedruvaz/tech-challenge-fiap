import { PartialType } from '@nestjs/swagger';
import { CriarClienteRequest } from './criar-cliente.request';

export class AtualizarClienteRequest extends PartialType(CriarClienteRequest) {}
