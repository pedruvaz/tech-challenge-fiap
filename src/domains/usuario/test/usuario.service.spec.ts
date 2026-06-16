import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Roles, Usuario } from '@prisma/client';
import { UsuarioRepository } from '../usuario.repository';
import { UsuarioService } from '../usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;

  const usuarioMock: Usuario = {
    idUsuario: 1,
    nome: 'João da Silva',
    email: 'joao.silva@oficina.com',
    senha: 'hash123',
    roles: Roles.funcionario,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    deletadoEm: null,
  };

  const repositoryMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: UsuarioRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
  });

  describe('create', () => {
    it('deve criar um usuário e não retornar a senha', async () => {
      repositoryMock.findByEmail.mockResolvedValue(null);
      repositoryMock.create.mockResolvedValue(usuarioMock);

      const resultado = await service.create({
        nome: usuarioMock.nome,
        email: usuarioMock.email,
        senha: 'senha123',
      });

      expect(resultado).not.toHaveProperty('senha');
      expect(resultado.email).toBe(usuarioMock.email);
    });

    it('deve lançar ConflictException se o email já existir', async () => {
      repositoryMock.findByEmail.mockResolvedValue(usuarioMock);

      await expect(
        service.create({
          nome: usuarioMock.nome,
          email: usuarioMock.email,
          senha: 'senha123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(repositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de usuários sem senha', async () => {
      repositoryMock.findAll.mockResolvedValue([usuarioMock]);

      const resultado = await service.findAll();

      expect(resultado).toHaveLength(1);
      expect(resultado[0]).not.toHaveProperty('senha');
    });
  });

  describe('findById', () => {
    it('deve retornar um usuário existente', async () => {
      repositoryMock.findById.mockResolvedValue(usuarioMock);

      const resultado = await service.findById(1);

      expect(resultado.idUsuario).toBe(1);
    });

    it('deve lançar NotFoundException quando o usuário não existir', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário existente', async () => {
      repositoryMock.findById.mockResolvedValue(usuarioMock);
      repositoryMock.findByEmail.mockResolvedValue(null);
      repositoryMock.update.mockResolvedValue({
        ...usuarioMock,
        nome: 'Novo Nome',
      });

      const resultado = await service.update(1, { nome: 'Novo Nome' });

      expect(resultado.nome).toBe('Novo Nome');
    });

    it('deve lançar NotFoundException ao atualizar usuário inexistente', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(service.update(999, { nome: 'Novo Nome' })).rejects.toThrow(
        NotFoundException,
      );

      expect(repositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se o novo email já pertencer a outro usuário', async () => {
      repositoryMock.findById.mockResolvedValue(usuarioMock);
      repositoryMock.findByEmail.mockResolvedValue({
        ...usuarioMock,
        idUsuario: 2,
      });

      await expect(
        service.update(1, { email: 'outro@oficina.com' }),
      ).rejects.toThrow(ConflictException);

      expect(repositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve permitir manter o mesmo email do próprio usuário', async () => {
      repositoryMock.findById.mockResolvedValue(usuarioMock);
      repositoryMock.findByEmail.mockResolvedValue(usuarioMock);
      repositoryMock.update.mockResolvedValue(usuarioMock);

      const resultado = await service.update(1, { email: usuarioMock.email });

      expect(resultado.email).toBe(usuarioMock.email);
      expect(repositoryMock.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve fazer soft delete de um usuário existente', async () => {
      repositoryMock.findById.mockResolvedValue(usuarioMock);
      repositoryMock.softDelete.mockResolvedValue({
        ...usuarioMock,
        deletadoEm: new Date(),
      });

      await service.remove(1);

      expect(repositoryMock.softDelete).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException ao remover usuário inexistente', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);

      expect(repositoryMock.softDelete).not.toHaveBeenCalled();
    });
  });
});
