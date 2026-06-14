import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateInsumosConsumidoDto {
    @ApiProperty({
        example: 'OS001',
        description: 'ID da ordem de serviço',
    })
    @IsString()
    @IsNotEmpty()
    osId: string;

    @ApiProperty({
        example: 1,
        description: 'ID do insumo consumido',
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    insumoId: number;

    @ApiProperty({
        example: 3,
        description: 'Quantidade consumida',
    })
    @IsNumber()
    @Min(1)
    qtdConsumida: number;

    @ApiProperty({
        example: 49.9,
        description: 'Valor unitário do insumo consumido',
    })
    @IsNumber()
    @Min(0)
    valor: number;
}
function Type(arg0: () => NumberConstructor): (target: CreateInsumosConsumidoDto, propertyKey: "insumoId") => void {
    throw new Error("Function not implemented.");
}

