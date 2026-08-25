import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { AtualizarUsuarioUseCase } from '../../application/use-cases/atualizar-usuario.use-case';
import { BuscarUsuarioPorIdUseCase } from '../../application/use-cases/buscar-usuario-por-id.use-case';
import { CriarUsuarioUseCase } from '../../application/use-cases/criar-usuario.use-case';
import { ListarUsuariosUseCase } from '../../application/use-cases/listar-usuarios.use-case';
import { RemoverUsuarioUseCase } from '../../application/use-cases/remover-usuario.use-case';
import { AtualizarUsuarioRequest } from './dtos/atualizar-usuario.request';
import { CriarUsuarioRequest } from './dtos/criar-usuario.request';
import { UsuarioResponseDto } from './dtos/usuario.response';
import { UsuarioPresenter } from './usuario.presenter';

@ApiTags('usuarios')
@ApiBearerAuth('access-token')
@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly criar: CriarUsuarioUseCase,
    private readonly listar: ListarUsuariosUseCase,
    private readonly buscarPorId: BuscarUsuarioPorIdUseCase,
    private readonly atualizar: AtualizarUsuarioUseCase,
    private readonly remover: RemoverUsuarioUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    type: UsuarioResponseDto,
  })
  @ApiConflictResponse({ description: 'Já existe um usuário com este email' })
  async criarUsuario(
    @Body() body: CriarUsuarioRequest,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.criar.executar(body);
    return UsuarioPresenter.apresentar(usuario);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiOkResponse({
    description: 'Lista de usuários',
    type: UsuarioResponseDto,
    isArray: true,
  })
  async listarUsuarios(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.listar.executar();
    return UsuarioPresenter.apresentarLista(usuarios);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo id' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Usuário encontrado',
    type: UsuarioResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async buscar(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.buscarPorId.executar(id);
    return UsuarioPresenter.apresentar(usuario);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um usuário' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Usuário atualizado com sucesso',
    type: UsuarioResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiConflictResponse({ description: 'Já existe um usuário com este email' })
  async atualizarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AtualizarUsuarioRequest,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.atualizar.executar({ idUsuario: id, ...body });
    return UsuarioPresenter.apresentar(usuario);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) um usuário' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'Usuário removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  removerUsuario(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.remover.executar(id);
  }
}
