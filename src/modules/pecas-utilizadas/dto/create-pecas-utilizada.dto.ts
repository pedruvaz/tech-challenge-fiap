import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreatePecasUtilizadaDto {
    @ApiProperty({
        example: 'OS001',
        description: 'ID da ordem de serviço',
    })
    @IsString()
    @IsNotEmpty()
    osId: string;

    @ApiProperty({
        example: 1,
        description: 'ID da peça utilizada',
    })
    @IsInt()
    @Min(1)
    pecaId: number;

    @ApiProperty({
        example: 3,
        description: 'Quantidade consumida',
    })
    @IsNumber()
    @Min(1)
    qtd: number;

    @ApiProperty({
        example: 49.9,
        description: 'Valor da peça',
    })
    @IsNumber()
    @Min(0)
    valor: number;
}
