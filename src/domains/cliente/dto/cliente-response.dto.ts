import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Cliente, Tipo } from '@prisma/client';

export class ClienteResponseDto {
  @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
  clienteId: string;

  @ApiProperty({ example: '111.444.777-35' })
  numDocumento: string;

  @ApiProperty({ example: 'João da Silva' })
  nome: string;

  @ApiPropertyOptional({ example: 'joao@email.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: '11999998888' })
  telefone: string;

  @ApiProperty({ enum: Tipo, example: Tipo.pessoa_fisica })
  tipo: Tipo;

  @ApiProperty()
  criadoEm: Date;

  @ApiProperty()
  atualizadoEm: Date;

  constructor(cliente: Cliente) {
    this.clienteId = cliente.clienteId;
    this.numDocumento = cliente.numDocumento;
    this.nome = cliente.nome;
    this.email = cliente.email ?? null;
    this.telefone = cliente.telefone;
    this.tipo = cliente.tipo;
    this.criadoEm = cliente.criadoEm;
    this.atualizadoEm = cliente.atualizadoEm;
  }
}
