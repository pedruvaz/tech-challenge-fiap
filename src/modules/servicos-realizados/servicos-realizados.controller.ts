import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ServicosRealizadosService } from './servicos-realizados.service';
import { CreateServicosRealizadosDto } from './dto/create-servicos-realizado.dto';
import { UpdateServicosRealizadosDto } from './dto/update-servicos-realizado.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ServicosRealizado } from './entities/servicos-realizado.entity';

@ApiTags('Serviços Realizados')
@Controller('servicos-realizados')
export class ServicosRealizadosController {
  constructor(private readonly servicosRealizadosService: ServicosRealizadosService) { }

  @Post()
  create(@Body() createServicosRealizadoDto: CreateServicosRealizadosDto) {
    return this.servicosRealizadosService.create(createServicosRealizadoDto);
  }

  @Get()
  findAll() {
    return this.servicosRealizadosService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.servicosRealizadosService.findOne(+id);
  // }

  @Patch(':osId/:servicoId')
  @ApiOkResponse({ type: [ServicosRealizado] })
  update(
    @Param('osId') osId: string,
    @Param('servicoId', ParseIntPipe) servicoId: number,
    @Body() updateServicosRealizadosDto: UpdateServicosRealizadosDto,
  ) {
    return this.servicosRealizadosService.update(
      osId,
      Number(servicoId),
      updateServicosRealizadosDto,
    );
  }

  @Delete(':osId/:servicoId')
  @ApiOkResponse({ type: [ServicosRealizado] })
  remove(
    @Param('osId') osId: string,
    @Param('servicoId', ParseIntPipe) servicoId: number,
  ) {
    return this.servicosRealizadosService.remove(osId, Number(servicoId));
  }
}
