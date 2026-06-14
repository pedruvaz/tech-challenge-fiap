import { IsNotEmpty, IsNumber, IsString, Min, MinLength } from "class-validator";

export class CreatePecaDto {
    @IsString()
    @MinLength(2, { message: 'O nome deve conter no mínimo 2 caracteres.' })
    @IsNotEmpty()
    nome: string;

    @IsNumber()
    @Min(0)
    qtdEstoque: number;

    @IsNumber()
    @Min(0)
    valorUn: number;

    constructor(nome = '', qtd_estoque = 0, valorUn = 0) {
        this.nome = nome;
        this.qtdEstoque = qtd_estoque;
        this.valorUn = valorUn;
    }
}
