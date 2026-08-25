import { Module, Provider } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AtualizarUsuarioUseCase } from '../application/use-cases/atualizar-usuario.use-case';
import { BuscarUsuarioPorIdUseCase } from '../application/use-cases/buscar-usuario-por-id.use-case';
import { CriarUsuarioUseCase } from '../application/use-cases/criar-usuario.use-case';
import { ListarUsuariosUseCase } from '../application/use-cases/listar-usuarios.use-case';
import { RemoverUsuarioUseCase } from '../application/use-cases/remover-usuario.use-case';
import { UsuarioRepository } from '../domain/repositories/usuario.repository';
import { UsuarioController } from './http/usuario.controller';
import { PrismaUsuarioRepository } from './persistence/prisma-usuario.repository';

const repositoryBindings: Provider[] = [
  { provide: UsuarioRepository, useClass: PrismaUsuarioRepository },
];

// Use cases como classes puras (sem @Injectable) — instanciamos via factory
// para preservar a separação Clean Architecture entre application e NestJS.
const useCaseProviders: Provider[] = [
  {
    provide: CriarUsuarioUseCase,
    useFactory: (repo: UsuarioRepository) => new CriarUsuarioUseCase(repo),
    inject: [UsuarioRepository],
  },
  {
    provide: ListarUsuariosUseCase,
    useFactory: (repo: UsuarioRepository) => new ListarUsuariosUseCase(repo),
    inject: [UsuarioRepository],
  },
  {
    provide: BuscarUsuarioPorIdUseCase,
    useFactory: (repo: UsuarioRepository) =>
      new BuscarUsuarioPorIdUseCase(repo),
    inject: [UsuarioRepository],
  },
  {
    provide: AtualizarUsuarioUseCase,
    useFactory: (repo: UsuarioRepository) => new AtualizarUsuarioUseCase(repo),
    inject: [UsuarioRepository],
  },
  {
    provide: RemoverUsuarioUseCase,
    useFactory: (repo: UsuarioRepository) => new RemoverUsuarioUseCase(repo),
    inject: [UsuarioRepository],
  },
];

@Module({
  imports: [PrismaModule],
  controllers: [UsuarioController],
  providers: [...repositoryBindings, ...useCaseProviders],
  // Exportamos o port UsuarioRepository para consumidores externos (ex.: auth)
  // dependerem apenas da abstração.
  exports: [UsuarioRepository],
})
export class UsuarioModule {}
