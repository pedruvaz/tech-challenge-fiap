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
import { AtualizarClienteUseCase } from '../../application/use-cases/atualizar-cliente.use-case';
import { BuscarClientePorIdUseCase } from '../../application/use-cases/buscar-cliente-por-id.use-case';
import { CriarClienteUseCase } from '../../application/use-cases/criar-cliente.use-case';
import { ListarClientesUseCase } from '../../application/use-cases/listar-clientes.use-case';
import { RemoverClienteUseCase } from '../../application/use-cases/remover-cliente.use-case';
import { ClientePresenter } from './cliente.presenter';
import { AtualizarClienteRequest } from './dtos/atualizar-cliente.request';
import { ClienteResponseDto } from './dtos/cliente.response';
import { CriarClienteRequest } from './dtos/criar-cliente.request';

@ApiTags('clientes')
@ApiBearerAuth('access-token')
@Controller('clientes')
export class ClienteController {
  constructor(
    private readonly criar: CriarClienteUseCase,
    private readonly listar: ListarClientesUseCase,
    private readonly buscarPorId: BuscarClientePorIdUseCase,
    private readonly atualizar: AtualizarClienteUseCase,
    private readonly remover: RemoverClienteUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo cliente' })
  @ApiCreatedResponse({
    description: 'Cliente criado com sucesso',
    type: ClienteResponseDto,
  })
  @ApiConflictResponse({
    description: 'Já existe um cliente com este número de documento',
  })
  async criarCliente(
    @Body() body: CriarClienteRequest,
  ): Promise<ClienteResponseDto> {
    const cliente = await this.criar.executar(body);
    return ClientePresenter.apresentar(cliente);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os clientes' })
  @ApiOkResponse({
    description: 'Lista de clientes',
    type: ClienteResponseDto,
    isArray: true,
  })
  async listarClientes(): Promise<ClienteResponseDto[]> {
    const clientes = await this.listar.executar();
    return ClientePresenter.apresentarLista(clientes);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um cliente pelo id' })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @ApiOkResponse({
    description: 'Cliente encontrado',
    type: ClienteResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Cliente não encontrado' })
  async buscar(@Param('id') id: string): Promise<ClienteResponseDto> {
    const cliente = await this.buscarPorId.executar(id);
    return ClientePresenter.apresentar(cliente);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um cliente' })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @ApiOkResponse({
    description: 'Cliente atualizado com sucesso',
    type: ClienteResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Cliente não encontrado' })
  @ApiConflictResponse({
    description: 'Já existe um cliente com este número de documento',
  })
  async atualizarCliente(
    @Param('id') id: string,
    @Body() body: AtualizarClienteRequest,
  ): Promise<ClienteResponseDto> {
    const cliente = await this.atualizar.executar({
      clienteId: id,
      ...body,
    });
    return ClientePresenter.apresentar(cliente);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) um cliente' })
  @ApiParam({
    name: 'id',
    type: String,
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @ApiNoContentResponse({ description: 'Cliente removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Cliente não encontrado' })
  removerCliente(@Param('id') id: string): Promise<void> {
    return this.remover.executar(id);
  }
}
