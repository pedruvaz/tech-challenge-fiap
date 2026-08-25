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
import { UsuarioAutenticado } from '../../../../common/decorators/usuario-autenticado.decorator';
import { AdicionarInsumoNaOsUseCase } from '../../application/use-cases/adicionar-insumo-na-os.use-case';
import { AdicionarPecaNaOsUseCase } from '../../application/use-cases/adicionar-peca-na-os.use-case';
import { AdicionarServicoNaOsUseCase } from '../../application/use-cases/adicionar-servico-na-os.use-case';
import { AprovarOrcamentoUseCase } from '../../application/use-cases/aprovar-orcamento.use-case';
import { AvancarStatusOsUseCase } from '../../application/use-cases/avancar-status-os.use-case';
import { BuscarOrdemServicoPorIdUseCase } from '../../application/use-cases/buscar-ordem-servico-por-id.use-case';
import { CalcularTempoMedioExecucaoUseCase } from '../../application/use-cases/calcular-tempo-medio-execucao.use-case';
import { CriarOrdemServicoUseCase } from '../../application/use-cases/criar-ordem-servico.use-case';
import { ListarOrdensServicoUseCase } from '../../application/use-cases/listar-ordens-servico.use-case';
import { RemoverInsumoDaOsUseCase } from '../../application/use-cases/remover-insumo-da-os.use-case';
import { RemoverOrdemServicoUseCase } from '../../application/use-cases/remover-ordem-servico.use-case';
import { RemoverPecaDaOsUseCase } from '../../application/use-cases/remover-peca-da-os.use-case';
import { RemoverServicoDaOsUseCase } from '../../application/use-cases/remover-servico-da-os.use-case';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { OrdemServicoViewRepository } from '../../domain/repositories/ordem-servico.view';
import { AdicionarInsumoRequest } from './dtos/adicionar-insumo.request';
import { AdicionarPecaRequest } from './dtos/adicionar-peca.request';
import { AdicionarServicoRequest } from './dtos/adicionar-servico.request';
import { AtualizarStatusRequest } from './dtos/atualizar-status.request';
import { CriarOrdemServicoRequest } from './dtos/criar-ordem-servico.request';
import { OrdemServicoResponseDto } from './dtos/ordem-servico.response';
import { OrdemServicoPresenter } from './ordem-servico.presenter';

@ApiTags('ordens-servico')
@ApiBearerAuth('access-token')
@Controller('ordens-servico')
export class OrdemServicoController {
  constructor(
    private readonly criar: CriarOrdemServicoUseCase,
    private readonly listar: ListarOrdensServicoUseCase,
    private readonly buscarPorId: BuscarOrdemServicoPorIdUseCase,
    private readonly avancarStatus: AvancarStatusOsUseCase,
    private readonly aprovarOrcamento: AprovarOrcamentoUseCase,
    private readonly remover: RemoverOrdemServicoUseCase,
    private readonly adicionarServico: AdicionarServicoNaOsUseCase,
    private readonly removerServico: RemoverServicoDaOsUseCase,
    private readonly adicionarPeca: AdicionarPecaNaOsUseCase,
    private readonly removerPeca: RemoverPecaDaOsUseCase,
    private readonly adicionarInsumo: AdicionarInsumoNaOsUseCase,
    private readonly removerInsumo: RemoverInsumoDaOsUseCase,
    private readonly calcularTempoMedio: CalcularTempoMedioExecucaoUseCase,
    private readonly view: OrdemServicoViewRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova ordem de serviço' })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  async criarOs(
    @Body() body: CriarOrdemServicoRequest,
  ): Promise<OrdemServicoResponseDto> {
    const os = await this.criar.executar(body);
    return this.apresentarPorId(os.osId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ordens de serviço' })
  @ApiQuery({ name: 'status', enum: Status, required: false })
  @ApiQuery({ name: 'clienteId', required: false, type: String })
  @ApiOkResponse({ type: [OrdemServicoResponseDto] })
  async listarOs(
    @Query('status') status?: Status,
    @Query('clienteId') clienteId?: string,
  ): Promise<OrdemServicoResponseDto[]> {
    const views = await this.view.listar({ status, clienteId });
    return OrdemServicoPresenter.apresentarLista(views);
  }

  @Get('metricas/tempo-medio')
  @ApiOperation({
    summary:
      'Tempo médio na etapa de execução (de em_execucao até finalizada), calculado pelo histórico de status',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        tempoMedioMs: { type: 'number' },
        tempoMedioMinutos: { type: 'number' },
        tempoMedioHoras: { type: 'number' },
      },
    },
  })
  tempoMedio(): Promise<{
    tempoMedioMs: number;
    tempoMedioMinutos: number;
    tempoMedioHoras: number;
  }> {
    return this.calcularTempoMedio.executar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ordem de serviço por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  async buscarPorIdOs(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrdemServicoResponseDto> {
    await this.buscarPorId.executar(id);
    return this.apresentarPorId(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status da ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  async atualizarStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AtualizarStatusRequest,
    @UsuarioAutenticado() usuarioId?: number,
  ): Promise<OrdemServicoResponseDto> {
    await this.avancarStatus.executar({
      osId: id,
      novoStatus: body.status,
      usuarioId,
    });
    return this.apresentarPorId(id);
  }

  @Post(':id/aprovar-orcamento')
  @ApiOperation({ summary: 'Aprovar orçamento da ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  async aprovar(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAutenticado() usuarioId?: number,
  ): Promise<OrdemServicoResponseDto> {
    await this.aprovarOrcamento.executar({ osId: id, usuarioId });
    return this.apresentarPorId(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover ordem de serviço (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse()
  removerOs(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.remover.executar(id);
  }

  @Post(':id/servicos')
  @ApiOperation({ summary: 'Adicionar serviço à ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  async addServico(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AdicionarServicoRequest,
  ): Promise<OrdemServicoResponseDto> {
    await this.adicionarServico.executar({
      osId: id,
      servicoId: body.servicoId,
      quantidade: body.quantidade,
    });
    return this.apresentarPorId(id);
  }

  @Delete(':id/servicos/:servicoId')
  @ApiOperation({ summary: 'Remover serviço da ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'servicoId', type: Number })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  async delServico(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('servicoId', ParseIntPipe) servicoId: number,
  ): Promise<OrdemServicoResponseDto> {
    await this.removerServico.executar({ osId: id, servicoId });
    return this.apresentarPorId(id);
  }

  @Post(':id/pecas')
  @ApiOperation({ summary: 'Adicionar peça à ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  async addPeca(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AdicionarPecaRequest,
  ): Promise<OrdemServicoResponseDto> {
    await this.adicionarPeca.executar({
      osId: id,
      pecaId: body.pecaId,
      qtd: body.qtd,
    });
    return this.apresentarPorId(id);
  }

  @Delete(':id/pecas/:pecaId')
  @ApiOperation({ summary: 'Remover peça da ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'pecaId', type: Number })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  async delPeca(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pecaId', ParseIntPipe) pecaId: number,
  ): Promise<OrdemServicoResponseDto> {
    await this.removerPeca.executar({ osId: id, pecaId });
    return this.apresentarPorId(id);
  }

  @Post(':id/insumos')
  @ApiOperation({ summary: 'Adicionar insumo à ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  async addInsumo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AdicionarInsumoRequest,
  ): Promise<OrdemServicoResponseDto> {
    await this.adicionarInsumo.executar({
      osId: id,
      insumoId: body.insumoId,
      qtdConsumida: body.qtdConsumida,
    });
    return this.apresentarPorId(id);
  }

  @Delete(':id/insumos/:insumoId')
  @ApiOperation({ summary: 'Remover insumo da ordem de serviço' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'insumoId', type: Number })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  async delInsumo(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('insumoId', ParseIntPipe) insumoId: number,
  ): Promise<OrdemServicoResponseDto> {
    await this.removerInsumo.executar({ osId: id, insumoId });
    return this.apresentarPorId(id);
  }

  private async apresentarPorId(id: string): Promise<OrdemServicoResponseDto> {
    const view = await this.view.buscarPorId(id);
    if (!view) throw new OsNaoEncontradaException(id);
    return OrdemServicoPresenter.apresentar(view);
  }
}
