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
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { UsuarioService } from './usuario.service';

@ApiTags('usuarios')
@ApiBearerAuth('access-token')
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    type: UsuarioResponseDto,
  })
  @ApiConflictResponse({ description: 'Já existe um usuário com este email' })
  create(@Body() dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    return this.usuarioService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiOkResponse({
    description: 'Lista de usuários',
    type: UsuarioResponseDto,
    isArray: true,
  })
  findAll(): Promise<UsuarioResponseDto[]> {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo id' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Usuário encontrado',
    type: UsuarioResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UsuarioResponseDto> {
    return this.usuarioService.findById(id);
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    return this.usuarioService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) um usuário' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiNoContentResponse({ description: 'Usuário removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usuarioService.remove(id);
  }
}
