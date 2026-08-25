import { ApiProperty } from '@nestjs/swagger';

export class InsumoResponseDto {
  @ApiProperty({ example: 1 }) insumoId: number;
  @ApiProperty({ example: 'Óleo de motor' }) nome: string;
  @ApiProperty({ example: 10 }) qtdEstoque: number;
  @ApiProperty({ example: 49.9 }) valorUn: number;
  @ApiProperty() criadoEm: Date;
  @ApiProperty() atualizadoEm: Date;
}
