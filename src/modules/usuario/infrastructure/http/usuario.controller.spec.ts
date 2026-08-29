import { Roles } from '@prisma/client';
import { AtualizarUsuarioUseCase } from '../../application/use-cases/atualizar-usuario.use-case';
import { BuscarUsuarioPorIdUseCase } from '../../application/use-cases/buscar-usuario-por-id.use-case';
import { CriarUsuarioUseCase } from '../../application/use-cases/criar-usuario.use-case';
import { ListarUsuariosUseCase } from '../../application/use-cases/listar-usuarios.use-case';
import { RemoverUsuarioUseCase } from '../../application/use-cases/remover-usuario.use-case';
import { Usuario } from '../../domain/entities/usuario.entity';
import { UsuarioNaoEncontradoException } from '../../domain/exceptions/usuario-nao-encontrado.exception';
import { UsuarioController } from './usuario.controller';

const persistido = (idUsuario = 7, nome = 'Ana'): Usuario =>
  Usuario.reconstituir({
    idUsuario,
    nome,
    email: `${nome.toLowerCase()}@oficina.com`,
    senhaHash: 'hash-secreto',
    roles: Roles.admin,
    criadoEm: new Date('2024-01-01T00:00:00Z'),
    atualizadoEm: new Date('2024-02-01T00:00:00Z'),
    deletadoEm: null,
  });

function montar() {
  const criar = { executar: jest.fn() };
  const listar = { executar: jest.fn() };
  const buscarPorId = { executar: jest.fn() };
  const atualizar = { executar: jest.fn() };
  const remover = { executar: jest.fn() };

  const controller = new UsuarioController(
    criar as unknown as CriarUsuarioUseCase,
    listar as unknown as ListarUsuariosUseCase,
    buscarPorId as unknown as BuscarUsuarioPorIdUseCase,
    atualizar as unknown as AtualizarUsuarioUseCase,
    remover as unknown as RemoverUsuarioUseCase,
  );

  return { controller, criar, listar, buscarPorId, atualizar, remover };
}

describe('UsuarioController', () => {
  describe('POST /usuarios', () => {
    it('repassa o body e devolve o DTO sem a senha', async () => {
      const { controller, criar } = montar();
      criar.executar.mockResolvedValue(persistido());
      const body = {
        nome: 'Ana',
        email: 'ana@oficina.com',
        senha: 'segredo',
        roles: Roles.admin,
      };

      const dto = await controller.criarUsuario(body);

      expect(criar.executar).toHaveBeenCalledWith(body);
      expect(dto.idUsuario).toBe(7);
      expect(JSON.stringify(dto)).not.toContain('hash-secreto');
    });
  });

  describe('GET /usuarios', () => {
    it('apresenta a lista devolvida pelo use-case', async () => {
      const { controller, listar } = montar();
      listar.executar.mockResolvedValue([
        persistido(7, 'Ana'),
        persistido(8, 'Bruno'),
      ]);

      const dtos = await controller.listarUsuarios();

      expect(dtos.map((d) => d.idUsuario)).toEqual([7, 8]);
    });

    it('devolve array vazio quando não há usuários', async () => {
      const { controller, listar } = montar();
      listar.executar.mockResolvedValue([]);

      await expect(controller.listarUsuarios()).resolves.toEqual([]);
    });
  });

  describe('GET /usuarios/:id', () => {
    it('busca pelo id numérico da rota', async () => {
      const { controller, buscarPorId } = montar();
      buscarPorId.executar.mockResolvedValue(persistido());

      const dto = await controller.buscar(7);

      expect(buscarPorId.executar).toHaveBeenCalledWith(7);
      expect(dto.idUsuario).toBe(7);
    });

    it('propaga UsuarioNaoEncontradoException', async () => {
      const { controller, buscarPorId } = montar();
      buscarPorId.executar.mockRejectedValue(
        new UsuarioNaoEncontradoException(99),
      );

      await expect(controller.buscar(99)).rejects.toThrow(
        UsuarioNaoEncontradoException,
      );
    });
  });

  describe('PATCH /usuarios/:id', () => {
    it('combina o id da rota com o body', async () => {
      const { controller, atualizar } = montar();
      atualizar.executar.mockResolvedValue(persistido(7, 'AnaMaria'));

      const dto = await controller.atualizarUsuario(7, { nome: 'AnaMaria' });

      expect(atualizar.executar).toHaveBeenCalledWith({
        idUsuario: 7,
        nome: 'AnaMaria',
      });
      expect(dto.nome).toBe('AnaMaria');
    });
  });

  describe('DELETE /usuarios/:id', () => {
    it('delega a remoção e resolve sem corpo', async () => {
      const { controller, remover } = montar();
      remover.executar.mockResolvedValue(undefined);

      await expect(controller.removerUsuario(7)).resolves.toBeUndefined();
      expect(remover.executar).toHaveBeenCalledWith(7);
    });

    it('propaga erro quando o usuário não existe', async () => {
      const { controller, remover } = montar();
      remover.executar.mockRejectedValue(new UsuarioNaoEncontradoException(99));

      await expect(controller.removerUsuario(99)).rejects.toThrow(
        UsuarioNaoEncontradoException,
      );
    });
  });
});
