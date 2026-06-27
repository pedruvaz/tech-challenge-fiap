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
import { InsumosService } from './insumos.service';
import { CreateInsumoDto } from './dto/create-insumo.dto';
import { UpdateInsumoDto } from './dto/update-insumo.dto';
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
import { Insumo } from './entities/insumo.entity';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';

@ApiTags('Insumos')
@ApiBearerAuth('access-token')
@Controller('insumos')
export class InsumosController {
  constructor(private readonly insumosService: InsumosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo insumo' })
  @ApiCreatedResponse({
    description: 'Insumo criado com sucesso',
    type: Insumo,
  })
  @ApiConflictResponse({ description: 'Já existe um insumo com este nome' })
  create(@Body() createInsumoDto: CreateInsumoDto) {
    return this.insumosService.create(createInsumoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os insumos' })
  @ApiOkResponse({ description: 'Lista de insumos', type: [Insumo] })
  findAll() {
    return this.insumosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um insumo pelo id' })
  @ApiOkResponse({ type: Insumo })
  @ApiNotFoundResponse({ description: 'Insumo não encontrado' })
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.insumosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um insumo' })
  @ApiOkResponse({
    description: 'Insumo atualizado com sucesso',
    type: Insumo,
  })
  @ApiNotFoundResponse({ description: 'Insumo não encontrado' })
  @ApiConflictResponse({ description: 'Já existe um insumo com este nome' })
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateInsumoDto: UpdateInsumoDto,
  ) {
    return this.insumosService.update(+id, updateInsumoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) um insumo' })
  @ApiOkResponse({
    description: 'Insumo removido com sucesso',
    type: Insumo,
  })
  @ApiNoContentResponse({ description: 'Insumo removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Insumo não encontrado' })
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.insumosService.remove(+id);
  }
}
