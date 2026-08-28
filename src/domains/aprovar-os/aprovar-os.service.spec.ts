import {
  BadRequestException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from 'src/libs/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AprovacaoService } from './aprovar-os.service';

describe('AprovacaoService', () => {
  let service: AprovacaoService;

  const osMock = {
    osId: 'os-uuid-1234',
    status: 'em_diagnostico',
    valorFinal: 500,
    cliente: {
      nome: 'João Silva',
      email: 'joao@email.com',
    },
  };

  const tokenRegistroMock = {
    token: 'token-uuid-1234',
    ordemServicoId: osMock.osId,
    emailCliente: osMock.cliente.email,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    usedAt: null,
    ordemServico: {
      ...osMock,
      status: 'aguardando_aprovacao',
    },
  };

  const prismaMock = {
    ordemServico: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    tokenAprovacao: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    historicoStatusOrdemServico: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const emailServiceMock = {
    enviarOrcamento: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AprovacaoService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmailService, useValue: emailServiceMock },
      ],
    }).compile();

    service = module.get<AprovacaoService>(AprovacaoService);
  });

  describe('solicitarAprovacao', () => {
    it('deve criar token e enviar e-mail quando a OS está em diagnóstico', async () => {
      prismaMock.ordemServico.findUnique.mockResolvedValue(osMock);
      prismaMock.$transaction.mockResolvedValue([]);
      emailServiceMock.enviarOrcamento.mockResolvedValue(undefined);

      await service.solicitarAprovacao(osMock.osId);

      expect(prismaMock.ordemServico.findUnique).toHaveBeenCalledWith({
        where: { osId: osMock.osId },
        include: { cliente: true },
      });
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(emailServiceMock.enviarOrcamento).toHaveBeenCalledWith(
        expect.objectContaining({
          emailCliente: osMock.cliente.email,
          nomeCliente: osMock.cliente.nome,
          osId: osMock.osId,
          valorFinal: Number(osMock.valorFinal),
        }),
      );
    });

    it('deve lançar NotFoundException quando a OS não existe', async () => {
      prismaMock.ordemServico.findUnique.mockResolvedValue(null);

      await expect(service.solicitarAprovacao('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException quando o status não é em_diagnostico', async () => {
      prismaMock.ordemServico.findUnique.mockResolvedValue({
        ...osMock,
        status: 'em_execucao',
      });

      await expect(service.solicitarAprovacao(osMock.osId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException quando o cliente não tem e-mail', async () => {
      prismaMock.ordemServico.findUnique.mockResolvedValue({
        ...osMock,
        cliente: { ...osMock.cliente, email: null },
      });

      await expect(service.solicitarAprovacao(osMock.osId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validarToken', () => {
    it('deve retornar o registro quando o token for válido', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue(tokenRegistroMock);

      const resultado = await service.validarToken(tokenRegistroMock.token);

      expect(resultado).toEqual(tokenRegistroMock);
      expect(prismaMock.tokenAprovacao.findUnique).toHaveBeenCalledWith({
        where: { token: tokenRegistroMock.token },
        include: { ordemServico: { include: { cliente: true } } },
      });
    });

    it('deve lançar BadRequestException quando o token não existir', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue(null);

      await expect(service.validarToken('token-invalido')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar GoneException quando o token já foi utilizado', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue({
        ...tokenRegistroMock,
        usedAt: new Date(),
      });

      await expect(service.validarToken(tokenRegistroMock.token)).rejects.toThrow(
        GoneException,
      );
    });

    it('deve lançar GoneException quando o token estiver expirado', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue({
        ...tokenRegistroMock,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.validarToken(tokenRegistroMock.token)).rejects.toThrow(
        GoneException,
      );
    });
  });

  describe('processarAprovacao', () => {
    it('deve aprovar a OS e atualizar status para em_execucao', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue(tokenRegistroMock);
      prismaMock.$transaction.mockResolvedValue([]);

      const resultado = await service.processarAprovacao(
        tokenRegistroMock.token,
        'aprovar',
      );

      expect(resultado.status).toBe('em_execucao');
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('deve rejeitar a OS e atualizar status para rejeitada', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue(tokenRegistroMock);
      prismaMock.$transaction.mockResolvedValue([]);

      const resultado = await service.processarAprovacao(
        tokenRegistroMock.token,
        'rejeitar',
      );

      expect(resultado.status).toBe('rejeitada');
    });

    it('deve lançar GoneException quando tentar processar token já utilizado', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue({
        ...tokenRegistroMock,
        usedAt: new Date(),
      });

      await expect(
        service.processarAprovacao(tokenRegistroMock.token, 'aprovar'),
      ).rejects.toThrow(GoneException);
    });
  });
});
