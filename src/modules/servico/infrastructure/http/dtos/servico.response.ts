import { ApiProperty } from '@nestjs/swagger';

export class ServicoResponseDto {
  @ApiProperty({ example: 1 }) servicoId: number;
  @ApiProperty({ example: 'Troca de óleo' }) descricao: string;
  @ApiProperty({ example: 100.0 }) valor: number;
  @ApiProperty() criadoEm: Date;
  @ApiProperty() atualizadoEm: Date;
}
