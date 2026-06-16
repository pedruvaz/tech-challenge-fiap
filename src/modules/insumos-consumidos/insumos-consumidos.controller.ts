import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { InsumosConsumidosService } from './insumos-consumidos.service';
import { CreateInsumosConsumidoDto } from './dto/create-insumos-consumido.dto';
import { UpdateInsumosConsumidoDto } from './dto/update-insumos-consumido.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InsumosConsumido } from './entities/insumos-consumido.entity';

@ApiTags('Insumos Consumidos')
@Controller('insumos-consumidos')
export class InsumosConsumidosController {
  constructor(
    private readonly insumosConsumidosService: InsumosConsumidosService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: InsumosConsumido })
  create(@Body() createInsumosConsumidoDto: CreateInsumosConsumidoDto) {
    return this.insumosConsumidosService.create(createInsumosConsumidoDto);
  }

  @Get()
  @ApiOkResponse({ type: [InsumosConsumido] })
  findAll() {
    return this.insumosConsumidosService.findAll();
  }

  // @Get('ordem-servico/:osId')
  // findOne(@Param('osId') osId: string) {
  //   return this.insumosConsumidosService.findByOrdemServico(osId);
  // }

  @Patch(':osId/:insumoId')
  @ApiOkResponse({ type: [InsumosConsumido] })
  update(
    @Param('osId') osId: string,
    @Param('insumoId', ParseIntPipe) insumoId: number,
    @Body() updateInsumosConsumidoDto: UpdateInsumosConsumidoDto,
  ) {
    return this.insumosConsumidosService.update(
      osId,
      Number(insumoId),
      updateInsumosConsumidoDto,
    );
  }

  @Delete(':osId/:insumoId')
  @ApiOkResponse({ type: [InsumosConsumido] })
  remove(
    @Param('osId') osId: string,
    @Param('insumoId', ParseIntPipe) insumoId: number,
  ) {
    return this.insumosConsumidosService.remove(osId, Number(insumoId));
  }
}
