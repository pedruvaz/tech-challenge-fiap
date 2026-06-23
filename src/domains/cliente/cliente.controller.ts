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
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { ClienteService } from './cliente.service';

@ApiTags('clientes')
@ApiBearerAuth('access-token')
@Controller('clientes')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo cliente' })
  @ApiCreatedResponse({
    description: 'Cliente criado com sucesso',
    type: ClienteResponseDto,
  })
  @ApiConflictResponse({
    description: 'Já existe um cliente com este número de documento',
  })
  create(@Body() dto: CreateClienteDto): Promise<ClienteResponseDto> {
    return this.clienteService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os clientes' })
  @ApiOkResponse({
    description: 'Lista de clientes',
    type: ClienteResponseDto,
    isArray: true,
  })
  findAll(): Promise<ClienteResponseDto[]> {
    return this.clienteService.findAll();
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
  findOne(@Param('id') id: string): Promise<ClienteResponseDto> {
    return this.clienteService.findById(id);
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
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClienteDto,
  ): Promise<ClienteResponseDto> {
    return this.clienteService.update(id, dto);
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
  remove(@Param('id') id: string): Promise<void> {
    return this.clienteService.remove(id);
  }
}
