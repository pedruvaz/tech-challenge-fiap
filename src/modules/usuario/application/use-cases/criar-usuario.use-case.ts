import * as bcrypt from 'bcrypt';
import { Roles } from '@prisma/client';
import { Usuario } from '../../domain/entities/usuario.entity';
import { EmailJaCadastradoException } from '../../domain/exceptions/email-ja-cadastrado.exception';
import { UsuarioRepository } from '../../domain/repositories/usuario.repository';

export type CriarUsuarioInput = {
  nome: string;
  email: string;
  senha: string;
  roles?: Roles;
};

const BCRYPT_ROUNDS = 10;

export class CriarUsuarioUseCase {
  constructor(private readonly repo: UsuarioRepository) {}

  async executar(input: CriarUsuarioInput): Promise<Usuario> {
    if (await this.repo.existeComEmail(input.email)) {
      throw new EmailJaCadastradoException();
    }

    const senhaHash = await bcrypt.hash(input.senha, BCRYPT_ROUNDS);
    const usuario = Usuario.criar({
      nome: input.nome,
      email: input.email,
      senhaHash,
      roles: input.roles ?? Roles.funcionario,
    });

    return this.repo.salvar(usuario);
  }
}
