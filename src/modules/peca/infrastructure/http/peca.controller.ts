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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ParseIdPipe } from '../../../../common/pipes/parse-id.pipe';
import { AtualizarPecaUseCase } from '../../application/use-cases/atualizar-peca.use-case';
import { BuscarPecaPorIdUseCase } from '../../application/use-cases/buscar-peca-por-id.use-case';
import { CriarPecaUseCase } from '../../application/use-cases/criar-peca.use-case';
import { ListarPecasUseCase } from '../../application/use-cases/listar-pecas.use-case';
import { RemoverPecaUseCase } from '../../application/use-cases/remover-peca.use-case';
import { AtualizarPecaRequest } from './dtos/atualizar-peca.request';
import { CriarPecaRequest } from './dtos/criar-peca.request';
import { PecaResponseDto } from './dtos/peca.response';
import { PecaPresenter } from './peca.presenter';

@ApiTags('Pecas')
@ApiBearerAuth('access-token')
@Controller('pecas')
export class PecaController {
  constructor(
    private readonly criar: CriarPecaUseCase,
    private readonly listar: ListarPecasUseCase,
    private readonly buscarPorId: BuscarPecaPorIdUseCase,
    private readonly atualizar: AtualizarPecaUseCase,
    private readonly remover: RemoverPecaUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova peça' })
  @ApiCreatedResponse({ description: 'Peça criada', type: PecaResponseDto })
  @ApiConflictResponse({ description: 'Já existe uma peça com este nome' })
  async criarPeca(@Body() body: CriarPecaRequest): Promise<PecaResponseDto> {
    const peca = await this.criar.executar(body);
    return PecaPresenter.apresentar(peca);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as peças' })
  @ApiOkResponse({
    description: 'Lista de peças',
    type: PecaResponseDto,
    isArray: true,
  })
  async listarPecas(): Promise<PecaResponseDto[]> {
    const pecas = await this.listar.executar();
    return PecaPresenter.apresentarLista(pecas);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma peça pelo id' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Peça encontrada', type: PecaResponseDto })
  @ApiNotFoundResponse({ description: 'Peça não encontrada' })
  async buscar(
    @Param('id', ParseIdPipe) id: number,
  ): Promise<PecaResponseDto> {
    const peca = await this.buscarPorId.executar(id);
    return PecaPresenter.apresentar(peca);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma peça' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Peça atualizada', type: PecaResponseDto })
  @ApiNotFoundResponse({ description: 'Peça não encontrada' })
  async atualizarPeca(
    @Param('id', ParseIdPipe) id: number,
    @Body() body: AtualizarPecaRequest,
  ): Promise<PecaResponseDto> {
    const peca = await this.atualizar.executar({ pecaId: id, ...body });
    return PecaPresenter.apresentar(peca);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) uma peça' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'Peça removida' })
  @ApiNotFoundResponse({ description: 'Peça não encontrada' })
  removerPeca(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.remover.executar(id);
  }
}
