import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PecasService } from './pecas.service';
import { CreatePecaDto } from './dto/create-peca.dto';
import { UpdatePecaDto } from './dto/update-peca.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Peca } from './entities/peca.entity';

@ApiTags('Pecas')
@ApiBearerAuth('access-token')
@Controller('pecas')
export class PecasController {
  constructor(private readonly pecasService: PecasService) {}

  @Post()
  @ApiCreatedResponse({ type: Peca })
  create(@Body() createPecaDto: CreatePecaDto) {
    return this.pecasService.create(createPecaDto);
  }

  @Get()
  @ApiOkResponse({ type: [Peca] })
  findAll() {
    return this.pecasService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: [Peca] })
  findOne(@Param('id') id: string) {
    return this.pecasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: [Peca] })
  update(@Param('id') id: string, @Body() updatePecaDto: UpdatePecaDto) {
    return this.pecasService.update(+id, updatePecaDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: [Peca] })
  remove(@Param('id') id: string) {
    return this.pecasService.remove(+id);
  }
}
