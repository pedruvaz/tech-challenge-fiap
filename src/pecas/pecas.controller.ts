import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PecasService } from './pecas.service';
import { CreatePecaDto } from './dto/create-peca.dto';
import { UpdatePecaDto } from './dto/update-peca.dto';

@Controller('pecas')
export class PecasController {
  constructor(private readonly pecasService: PecasService) {}

  @Post()
  create(@Body() createPecaDto: CreatePecaDto) {
    return this.pecasService.create(createPecaDto);
  }

  @Get()
  findAll() {
    return this.pecasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pecasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePecaDto: UpdatePecaDto) {
    return this.pecasService.update(+id, updatePecaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pecasService.remove(+id);
  }
}
