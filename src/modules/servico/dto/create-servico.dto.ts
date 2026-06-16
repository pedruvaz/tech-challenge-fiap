import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min, MinLength } from "class-validator";

export class CreateServicoDto {
    @ApiProperty({
        example: 'Óleo de motor',
        description: 'Nome do insumo',
    })
    @IsString()
    @MinLength(2, { message: 'A descrição deve conter no mínimo 2 caracteres.' })
    @IsNotEmpty()
    descricao: string;

    @ApiProperty({
        example: 100.0,
        description: 'Valor do serviço',
    })
    @IsNumber()
    @Min(0)
    valor: number;
}
