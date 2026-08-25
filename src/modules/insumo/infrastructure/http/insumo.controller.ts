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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ParseIdPipe } from '../../../../common/pipes/parse-id.pipe';
import { AtualizarInsumoUseCase } from '../../application/use-cases/atualizar-insumo.use-case';
import { BuscarInsumoPorIdUseCase } from '../../application/use-cases/buscar-insumo-por-id.use-case';
import { CriarInsumoUseCase } from '../../application/use-cases/criar-insumo.use-case';
import { ListarInsumosUseCase } from '../../application/use-cases/listar-insumos.use-case';
import { RemoverInsumoUseCase } from '../../application/use-cases/remover-insumo.use-case';
import { AtualizarInsumoRequest } from './dtos/atualizar-insumo.request';
import { CriarInsumoRequest } from './dtos/criar-insumo.request';
import { InsumoResponseDto } from './dtos/insumo.response';
import { InsumoPresenter } from './insumo.presenter';

@ApiTags('Insumos')
@ApiBearerAuth('access-token')
@Controller('insumos')
export class InsumoController {
  constructor(
    private readonly criar: CriarInsumoUseCase,
    private readonly listar: ListarInsumosUseCase,
    private readonly buscarPorId: BuscarInsumoPorIdUseCase,
    private readonly atualizar: AtualizarInsumoUseCase,
    private readonly remover: RemoverInsumoUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo insumo' })
  @ApiCreatedResponse({ description: 'Insumo criado', type: InsumoResponseDto })
  async criarInsumo(
    @Body() body: CriarInsumoRequest,
  ): Promise<InsumoResponseDto> {
    const insumo = await this.criar.executar(body);
    return InsumoPresenter.apresentar(insumo);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os insumos' })
  @ApiOkResponse({
    description: 'Lista de insumos',
    type: InsumoResponseDto,
    isArray: true,
  })
  async listarInsumos(): Promise<InsumoResponseDto[]> {
    const insumos = await this.listar.executar();
    return InsumoPresenter.apresentarLista(insumos);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um insumo pelo id' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Insumo encontrado', type: InsumoResponseDto })
  @ApiNotFoundResponse({ description: 'Insumo não encontrado' })
  async buscar(
    @Param('id', ParseIdPipe) id: number,
  ): Promise<InsumoResponseDto> {
    const insumo = await this.buscarPorId.executar(id);
    return InsumoPresenter.apresentar(insumo);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um insumo' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Insumo atualizado', type: InsumoResponseDto })
  @ApiNotFoundResponse({ description: 'Insumo não encontrado' })
  async atualizarInsumo(
    @Param('id', ParseIdPipe) id: number,
    @Body() body: AtualizarInsumoRequest,
  ): Promise<InsumoResponseDto> {
    const insumo = await this.atualizar.executar({ insumoId: id, ...body });
    return InsumoPresenter.apresentar(insumo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) um insumo' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'Insumo removido' })
  @ApiNotFoundResponse({ description: 'Insumo não encontrado' })
  removerInsumo(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.remover.executar(id);
  }
}
