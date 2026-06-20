import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Insumo } from './entities/insumo.entity';

@ApiTags('Insumos')
@Controller('insumos')
export class InsumosController {
  constructor(private readonly insumosService: InsumosService) {}

  @Post()
  @ApiCreatedResponse({ type: Insumo })
  create(@Body() createInsumoDto: CreateInsumoDto) {
    return this.insumosService.create(createInsumoDto);
  }

  @Get()
  @ApiOkResponse({ type: [Insumo] })
  findAll() {
    return this.insumosService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Insumo })
  findOne(@Param('id') id: string) {
    return this.insumosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Insumo })
  update(@Param('id') id: string, @Body() updateInsumoDto: UpdateInsumoDto) {
    return this.insumosService.update(+id, updateInsumoDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Insumo })
  remove(@Param('id') id: string) {
    return this.insumosService.remove(+id);
  }
}
