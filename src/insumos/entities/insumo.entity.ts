import { ApiProperty } from "@nestjs/swagger";

export class Insumo {
    @ApiProperty()
    insumoId: number;

    @ApiProperty()
    nome: string;

    @ApiProperty()
    qtdEstoque: number;

    @ApiProperty()
    valorUn: number;

    @ApiProperty()
    criadoEm: Date;

    @ApiProperty()
    atualizadoEm: Date;

    @ApiProperty({ nullable: true })
    deletadoEm?: Date | null;
}