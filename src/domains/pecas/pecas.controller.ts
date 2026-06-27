import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PecasService } from './pecas.service';
import { CreatePecaDto } from './dto/create-peca.dto';
import { UpdatePecaDto } from './dto/update-peca.dto';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Peca } from './entities/peca.entity';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';

@ApiTags('Pecas')
@ApiBearerAuth('access-token')
@Controller('pecas')
export class PecasController {
  constructor(private readonly pecasService: PecasService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova peça' })
  @ApiCreatedResponse({
    description: 'Peça criada com sucesso',
    type: Peca,
  })
  @ApiConflictResponse({ description: 'Já existe uma peça com este nome' })
  create(@Body() createPecaDto: CreatePecaDto) {
    return this.pecasService.create(createPecaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as peças' })
  @ApiOkResponse({
    description: 'Lista de peças',
    type: [Peca],
  })
  findAll() {
    return this.pecasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma peça pelo id' })
  @ApiOkResponse({
    description: 'Peça encontrada',
    type: [Peca],
  })
  @ApiNotFoundResponse({ description: 'Peça não encontrada' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.pecasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma peça' })
  @ApiOkResponse({
    description: 'Peça atualizada com sucesso',
    type: [Peca],
  })
  @ApiNotFoundResponse({ description: 'Peça não encontrada' })
  @ApiConflictResponse({ description: 'Já existe uma peça com este nome' })
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updatePecaDto: UpdatePecaDto,
  ) {
    return this.pecasService.update(+id, updatePecaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Peça removida com sucesso' })
  @ApiNotFoundResponse({ description: 'Peça não encontrada' })
  @ApiOkResponse({
    description: 'Peça removida com sucesso',
    type: [Peca],
  })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.pecasService.remove(+id);
  }
}
