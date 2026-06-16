import { Test, TestingModule } from '@nestjs/testing';
import { Roles, Usuario } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { UsuarioRepository } from '../usuario.repository';

describe('UsuarioRepository', () => {
  let repository: UsuarioRepository;

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

  const prismaMock = {
    usuario: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<UsuarioRepository>(UsuarioRepository);
  });

  it('deve criar um usuário', async () => {
    prismaMock.usuario.create.mockResolvedValue(usuarioMock);

    const resultado = await repository.create({
      nome: usuarioMock.nome,
      email: usuarioMock.email,
      senha: usuarioMock.senha,
    });

    expect(prismaMock.usuario.create).toHaveBeenCalledWith({
      data: {
        nome: usuarioMock.nome,
        email: usuarioMock.email,
        senha: usuarioMock.senha,
      },
    });
    expect(resultado).toEqual(usuarioMock);
  });

  it('deve listar usuários não deletados', async () => {
    prismaMock.usuario.findMany.mockResolvedValue([usuarioMock]);

    const resultado = await repository.findAll();

    expect(prismaMock.usuario.findMany).toHaveBeenCalledWith({
      where: { deletadoEm: null },
      orderBy: { idUsuario: 'asc' },
    });
    expect(resultado).toEqual([usuarioMock]);
  });

  it('deve buscar um usuário por id', async () => {
    prismaMock.usuario.findFirst.mockResolvedValue(usuarioMock);

    const resultado = await repository.findById(1);

    expect(prismaMock.usuario.findFirst).toHaveBeenCalledWith({
      where: { idUsuario: 1, deletadoEm: null },
    });
    expect(resultado).toEqual(usuarioMock);
  });

  it('deve retornar null quando o usuário não existir', async () => {
    prismaMock.usuario.findFirst.mockResolvedValue(null);

    const resultado = await repository.findById(999);

    expect(resultado).toBeNull();
  });

  it('deve buscar um usuário por email', async () => {
    prismaMock.usuario.findFirst.mockResolvedValue(usuarioMock);

    const resultado = await repository.findByEmail(usuarioMock.email);

    expect(prismaMock.usuario.findFirst).toHaveBeenCalledWith({
      where: { email: usuarioMock.email, deletadoEm: null },
    });
    expect(resultado).toEqual(usuarioMock);
  });

  it('deve atualizar um usuário', async () => {
    const usuarioAtualizado = { ...usuarioMock, nome: 'Novo Nome' };
    prismaMock.usuario.update.mockResolvedValue(usuarioAtualizado);

    const resultado = await repository.update(1, { nome: 'Novo Nome' });

    expect(prismaMock.usuario.update).toHaveBeenCalledWith({
      where: { idUsuario: 1 },
      data: { nome: 'Novo Nome' },
    });
    expect(resultado).toEqual(usuarioAtualizado);
  });

  it('deve fazer soft delete de um usuário', async () => {
    const usuarioDeletado = { ...usuarioMock, deletadoEm: new Date() };
    let argumentoRecebido:
      | { where: { idUsuario: number }; data: { deletadoEm: Date } }
      | undefined;
    prismaMock.usuario.update.mockImplementation(
      (args: typeof argumentoRecebido) => {
        argumentoRecebido = args;
        return Promise.resolve(usuarioDeletado);
      },
    );

    const resultado = await repository.softDelete(1);

    expect(argumentoRecebido?.where).toEqual({ idUsuario: 1 });
    expect(argumentoRecebido?.data.deletadoEm).toBeInstanceOf(Date);
    expect(resultado.deletadoEm).not.toBeNull();
  });
});
