import { ApiProperty } from "@nestjs/swagger";

export class Servico {
    @ApiProperty()
    servicoId: number;

    @ApiProperty()
    descricao: string;

    @ApiProperty()
    valor: number;

}
