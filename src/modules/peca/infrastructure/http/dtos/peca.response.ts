import { ApiProperty } from '@nestjs/swagger';

export class PecaResponseDto {
  @ApiProperty({ example: 1 }) pecaId: number;
  @ApiProperty({ example: 'Motor' }) nome: string;
  @ApiProperty({ example: 10 }) qtdEstoque: number;
  @ApiProperty({ example: 49.9 }) valorUn: number;
  @ApiProperty() criadoEm: Date;
  @ApiProperty() atualizadoEm: Date;
}
