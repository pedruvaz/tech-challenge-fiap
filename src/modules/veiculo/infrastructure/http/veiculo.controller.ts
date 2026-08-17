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
import { AtualizarVeiculoUseCase } from '../../application/use-cases/atualizar-veiculo.use-case';
import { BuscarVeiculoPorIdUseCase } from '../../application/use-cases/buscar-veiculo-por-id.use-case';
import { CriarVeiculoUseCase } from '../../application/use-cases/criar-veiculo.use-case';
import { ListarVeiculosUseCase } from '../../application/use-cases/listar-veiculos.use-case';
import { RemoverVeiculoUseCase } from '../../application/use-cases/remover-veiculo.use-case';
import { AtualizarVeiculoRequest } from './dtos/atualizar-veiculo.request';
import { CriarVeiculoRequest } from './dtos/criar-veiculo.request';
import { VeiculoResponseDto } from './dtos/veiculo.response';
import { VeiculoPresenter } from './veiculo.presenter';

@ApiTags('veiculos')
@ApiBearerAuth('access-token')
@Controller('veiculos')
export class VeiculoController {
  constructor(
    private readonly criar: CriarVeiculoUseCase,
    private readonly listar: ListarVeiculosUseCase,
    private readonly buscarPorId: BuscarVeiculoPorIdUseCase,
    private readonly atualizar: AtualizarVeiculoUseCase,
    private readonly remover: RemoverVeiculoUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo veículo' })
  @ApiCreatedResponse({
    description: 'Veículo criado com sucesso',
    type: VeiculoResponseDto,
  })
  @ApiConflictResponse({ description: 'Já existe um veículo com esta placa' })
  async criarVeiculo(
    @Body() body: CriarVeiculoRequest,
  ): Promise<VeiculoResponseDto> {
    const veiculo = await this.criar.executar(body);
    return VeiculoPresenter.apresentar(veiculo);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os veículos' })
  @ApiOkResponse({
    description: 'Lista de veículos',
    type: VeiculoResponseDto,
    isArray: true,
  })
  async listarVeiculos(): Promise<VeiculoResponseDto[]> {
    const veiculos = await this.listar.executar();
    return VeiculoPresenter.apresentarLista(veiculos);
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
  async buscar(@Param('id') id: string): Promise<VeiculoResponseDto> {
    const veiculo = await this.buscarPorId.executar(id);
    return VeiculoPresenter.apresentar(veiculo);
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
  async atualizarVeiculo(
    @Param('id') id: string,
    @Body() body: AtualizarVeiculoRequest,
  ): Promise<VeiculoResponseDto> {
    const veiculo = await this.atualizar.executar({ veiculoId: id, ...body });
    return VeiculoPresenter.apresentar(veiculo);
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
  removerVeiculo(@Param('id') id: string): Promise<void> {
    return this.remover.executar(id);
  }
}
