import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { UsuarioRepository } from './usuario.repository';

@Injectable()
export class UsuarioService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    const usuarioExistente = await this.usuarioRepository.findByEmail(
      dto.email,
    );

    if (usuarioExistente) {
      throw new ConflictException('Já existe um usuário com este email');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const usuario = await this.usuarioRepository.create({
      ...dto,
      senha: senhaHash,
    });
    return new UsuarioResponseDto(usuario);
  }

  async findAll(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.usuarioRepository.findAll();
    return usuarios.map((usuario) => new UsuarioResponseDto(usuario));
  }

  async findById(idUsuario: number): Promise<UsuarioResponseDto> {
    const usuario = await this.usuarioRepository.findById(idUsuario);

    if (!usuario) {
      throw new NotFoundException(`Usuário com id ${idUsuario} não encontrado`);
    }

    return new UsuarioResponseDto(usuario);
  }

  async update(
    idUsuario: number,
    dto: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    await this.findById(idUsuario);

    if (dto.email) {
      const usuarioComMesmoEmail = await this.usuarioRepository.findByEmail(
        dto.email,
      );

      if (
        usuarioComMesmoEmail &&
        usuarioComMesmoEmail.idUsuario !== idUsuario
      ) {
        throw new ConflictException('Já existe um usuário com este email');
      }
    }

    const usuario = await this.usuarioRepository.update(idUsuario, dto);
    return new UsuarioResponseDto(usuario);
  }

  async remove(idUsuario: number): Promise<void> {
    await this.findById(idUsuario);
    await this.usuarioRepository.softDelete(idUsuario);
  }
}
