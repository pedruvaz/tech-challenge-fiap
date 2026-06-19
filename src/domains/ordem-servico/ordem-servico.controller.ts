import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { AddInsumoDto } from './dto/add-insumo.dto';
import { AddPecaDto } from './dto/add-peca.dto';
import { AddServicoDto } from './dto/add-servico.dto';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { OrdemServicoResponseDto } from './dto/ordem-servico-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { OrdemServicoService } from './ordem-servico.service';

@ApiTags('ordens-servico')
@ApiBearerAuth()
@Controller('ordens-servico')
export class OrdemServicoController {
  constructor(private readonly service: OrdemServicoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova ordem de serviço' })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  create(@Body() dto: CreateOrdemServicoDto): Promise<OrdemServicoResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ordens de serviço' })
  @ApiQuery({ name: 'status', enum: Status, required: false })
  @ApiQuery({ name: 'clienteId', required: false, type: String })
  @ApiOkResponse({ type: [OrdemServicoResponseDto] })
  findAll(
    @Query('status') status?: Status,
    @Query('clienteId') clienteId?: string,
  ): Promise<OrdemServicoResponseDto[]> {
    return this.service.findAll({ status, clienteId });
  }

  @Get('metricas/tempo-medio')
  @ApiOperation({ summary: 'Obter tempo médio de execução das OS finalizadas' })
  @ApiOkResponse({
    schema: {
      properties: {
        tempoMedioMs: { type: 'number' },
        tempoMedioMinutos: { type: 'number' },
        tempoMedioHoras: { type: 'number' },
      },
    },
  })
  getTempoMedio(): Promise<{
    tempoMedioMs: number;
    tempoMedioMinutos: number;
    tempoMedioHoras: number;
  }> {
    return this.service.getTempoMedio();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ordem de serviço por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrdemServicoResponseDto> {
    return this.service.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status da ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ): Promise<OrdemServicoResponseDto> {
    return this.service.updateStatus(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover ordem de serviço (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Post(':id/servicos')
  @ApiOperation({ summary: 'Adicionar serviço à ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  addServico(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddServicoDto,
  ): Promise<OrdemServicoResponseDto> {
    return this.service.addServico(id, dto);
  }

  @Delete(':id/servicos/:servicoId')
  @ApiOperation({ summary: 'Remover serviço da ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'servicoId', type: Number })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  removeServico(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('servicoId', ParseIntPipe) servicoId: number,
  ): Promise<OrdemServicoResponseDto> {
    return this.service.removeServico(id, servicoId);
  }

  @Post(':id/pecas')
  @ApiOperation({ summary: 'Adicionar peça à ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  addPeca(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddPecaDto,
  ): Promise<OrdemServicoResponseDto> {
    return this.service.addPeca(id, dto);
  }

  @Delete(':id/pecas/:pecaId')
  @ApiOperation({ summary: 'Remover peça da ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'pecaId', type: Number })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  removePeca(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pecaId', ParseIntPipe) pecaId: number,
  ): Promise<OrdemServicoResponseDto> {
    return this.service.removePeca(id, pecaId);
  }

  @Post(':id/insumos')
  @ApiOperation({ summary: 'Adicionar insumo à ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  addInsumo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddInsumoDto,
  ): Promise<OrdemServicoResponseDto> {
    return this.service.addInsumo(id, dto);
  }

  @Delete(':id/insumos/:insumoId')
  @ApiOperation({ summary: 'Remover insumo da ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'insumoId', type: Number })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  removeInsumo(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('insumoId', ParseIntPipe) insumoId: number,
  ): Promise<OrdemServicoResponseDto> {
    return this.service.removeInsumo(id, insumoId);
  }
}
