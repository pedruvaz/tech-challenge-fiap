import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { VeiculoResponseDto } from './dto/veiculo-response.dto';
import { VeiculoService } from './veiculo.service';

@ApiTags('veiculos')
@Controller('veiculos')
export class VeiculoController {
  constructor(private readonly veiculoService: VeiculoService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo veículo' })
  @ApiCreatedResponse({
    description: 'Veículo criado com sucesso',
    type: VeiculoResponseDto,
  })
  @ApiConflictResponse({ description: 'Já existe um veículo com esta placa' })
  create(@Body() dto: CreateVeiculoDto): Promise<VeiculoResponseDto> {
    return this.veiculoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os veículos' })
  @ApiOkResponse({
    description: 'Lista de veículos',
    type: VeiculoResponseDto,
    isArray: true,
  })
  findAll(): Promise<VeiculoResponseDto[]> {
    return this.veiculoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um veículo pelo id' })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @ApiOkResponse({
    description: 'Veículo encontrado',
    type: VeiculoResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  findOne(@Param('id') id: string): Promise<VeiculoResponseDto> {
    return this.veiculoService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um veículo' })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @ApiOkResponse({
    description: 'Veículo atualizado com sucesso',
    type: VeiculoResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  @ApiConflictResponse({ description: 'Já existe um veículo com esta placa' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVeiculoDto,
  ): Promise<VeiculoResponseDto> {
    return this.veiculoService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) um veículo' })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @ApiNoContentResponse({ description: 'Veículo removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Veículo não encontrado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.veiculoService.remove(id);
  }
}
