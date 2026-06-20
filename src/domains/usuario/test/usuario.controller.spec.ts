import { Test, TestingModule } from '@nestjs/testing';
import { Roles } from '@prisma/client';
import { UsuarioController } from '../usuario.controller';
import { UsuarioResponseDto } from '../dto/usuario-response.dto';
import { UsuarioService } from '../usuario.service';

describe('UsuarioController', () => {
  let controller: UsuarioController;

  const usuarioResponseMock: UsuarioResponseDto = {
    idUsuario: 1,
    nome: 'João da Silva',
    email: 'joao.silva@oficina.com',
    roles: Roles.funcionario,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  };

  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [{ provide: UsuarioService, useValue: serviceMock }],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
  });

  it('deve criar um usuário', async () => {
    serviceMock.create.mockResolvedValue(usuarioResponseMock);

    const resultado = await controller.create({
      nome: usuarioResponseMock.nome,
      email: usuarioResponseMock.email,
      senha: 'senha123',
    });

    expect(serviceMock.create).toHaveBeenCalled();
    expect(resultado).toEqual(usuarioResponseMock);
  });

  it('deve listar usuários', async () => {
    serviceMock.findAll.mockResolvedValue([usuarioResponseMock]);

    const resultado = await controller.findAll();

    expect(resultado).toEqual([usuarioResponseMock]);
  });

  it('deve buscar um usuário pelo id', async () => {
    serviceMock.findById.mockResolvedValue(usuarioResponseMock);

    const resultado = await controller.findOne(1);

    expect(serviceMock.findById).toHaveBeenCalledWith(1);
    expect(resultado).toEqual(usuarioResponseMock);
  });

  it('deve atualizar um usuário', async () => {
    const atualizado = { ...usuarioResponseMock, nome: 'Novo Nome' };
    serviceMock.update.mockResolvedValue(atualizado);

    const resultado = await controller.update(1, { nome: 'Novo Nome' });

    expect(serviceMock.update).toHaveBeenCalledWith(1, { nome: 'Novo Nome' });
    expect(resultado).toEqual(atualizado);
  });

  it('deve remover (soft delete) um usuário', async () => {
    serviceMock.remove.mockResolvedValue(undefined);

    await controller.remove(1);

    expect(serviceMock.remove).toHaveBeenCalledWith(1);
  });
});
