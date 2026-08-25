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
import { AtualizarServicoUseCase } from '../../application/use-cases/atualizar-servico.use-case';
import { BuscarServicoPorIdUseCase } from '../../application/use-cases/buscar-servico-por-id.use-case';
import { CriarServicoUseCase } from '../../application/use-cases/criar-servico.use-case';
import { ListarServicosUseCase } from '../../application/use-cases/listar-servicos.use-case';
import { RemoverServicoUseCase } from '../../application/use-cases/remover-servico.use-case';
import { AtualizarServicoRequest } from './dtos/atualizar-servico.request';
import { CriarServicoRequest } from './dtos/criar-servico.request';
import { ServicoResponseDto } from './dtos/servico.response';
import { ServicoPresenter } from './servico.presenter';

@ApiTags('Servico')
@ApiBearerAuth('access-token')
@Controller('servico')
export class ServicoController {
  constructor(
    private readonly criar: CriarServicoUseCase,
    private readonly listar: ListarServicosUseCase,
    private readonly buscarPorId: BuscarServicoPorIdUseCase,
    private readonly atualizar: AtualizarServicoUseCase,
    private readonly remover: RemoverServicoUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo serviço' })
  @ApiCreatedResponse({
    description: 'Serviço criado',
    type: ServicoResponseDto,
  })
  async criarServico(
    @Body() body: CriarServicoRequest,
  ): Promise<ServicoResponseDto> {
    const servico = await this.criar.executar(body);
    return ServicoPresenter.apresentar(servico);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os serviços' })
  @ApiOkResponse({
    description: 'Lista de serviços',
    type: ServicoResponseDto,
    isArray: true,
  })
  async listarServicos(): Promise<ServicoResponseDto[]> {
    const servicos = await this.listar.executar();
    return ServicoPresenter.apresentarLista(servicos);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um serviço pelo id' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Serviço encontrado',
    type: ServicoResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
  async buscar(
    @Param('id', ParseIdPipe) id: number,
  ): Promise<ServicoResponseDto> {
    const servico = await this.buscarPorId.executar(id);
    return ServicoPresenter.apresentar(servico);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um serviço' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Serviço atualizado',
    type: ServicoResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
  async atualizarServico(
    @Param('id', ParseIdPipe) id: number,
    @Body() body: AtualizarServicoRequest,
  ): Promise<ServicoResponseDto> {
    const servico = await this.atualizar.executar({ servicoId: id, ...body });
    return ServicoPresenter.apresentar(servico);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) um serviço' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'Serviço removido' })
  @ApiNotFoundResponse({ description: 'Serviço não encontrado' })
  removerServico(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.remover.executar(id);
  }
}
