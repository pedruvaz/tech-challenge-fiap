import * as bcrypt from 'bcrypt';
import { Roles } from '@prisma/client';
import { Usuario } from '../../domain/entities/usuario.entity';
import { EmailJaCadastradoException } from '../../domain/exceptions/email-ja-cadastrado.exception';
import { UsuarioNaoEncontradoException } from '../../domain/exceptions/usuario-nao-encontrado.exception';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';

export type AtualizarUsuarioInput = {
  idUsuario: number;
  nome?: string;
  email?: string;
  senha?: string;
  roles?: Roles;
};

const BCRYPT_ROUNDS = 10;

export class AtualizarUsuarioUseCase {
  constructor(private readonly repo: UsuarioRepository) {}

  async executar(input: AtualizarUsuarioInput): Promise<Usuario> {
    const usuario = await this.repo.buscarPorId(input.idUsuario);
    if (!usuario) throw new UsuarioNaoEncontradoException(input.idUsuario);

    if (input.email !== undefined) {
      const conflito = await this.repo.existeComEmail(
        input.email,
        input.idUsuario,
      );
      if (conflito) throw new EmailJaCadastradoException();
    }

    const senhaHash =
      input.senha !== undefined
        ? await bcrypt.hash(input.senha, BCRYPT_ROUNDS)
        : undefined;

    usuario.alterar({
      nome: input.nome,
      email: input.email,
      senhaHash,
      roles: input.roles,
    });

    return this.repo.salvar(usuario);
  }
}
