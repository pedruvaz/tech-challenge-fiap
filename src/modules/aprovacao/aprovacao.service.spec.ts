import {
  BadRequestException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../../libs/email/email.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AprovacaoService } from './aprovacao.service';

describe('AprovacaoService', () => {
  let service: AprovacaoService;

  const clienteMock = {
    clienteId: 'cliente-1',
    nome: 'João Silva',
    email: 'joao@email.com',
    numDocumento: '111.444.777-35',
    telefone: '11999998888',
    tipo: 'pessoa_fisica',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    deletadoEm: null,
  };

  const osMock = {
    osId: 'os-uuid-1234',
    status: 'em_diagnostico' as const,
    valorFinal: { toNumber: () => 1500 } as any,
    clienteId: 'cliente-1',
    cliente: clienteMock,
  };

  const tokenMock = {
    id: 'token-id-1',
    token: 'uuid-token-valido',
    ordemServicoId: 'os-uuid-1234',
    emailCliente: 'joao@email.com',
    usedAt: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    ordemServico: { ...osMock, status: 'aguardando_aprovacao' as const },
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

  const emailMock = {
    enviarOrcamento: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.APP_URL = 'http://localhost:3000';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AprovacaoService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EmailService, useValue: emailMock },
      ],
    }).compile();

    service = module.get<AprovacaoService>(AprovacaoService);
  });

  // ─── solicitarAprovacao ───────────────────────────────────────────────────

  describe('solicitarAprovacao', () => {
    it('deve lançar NotFoundException quando a OS não existe', async () => {
      prismaMock.ordemServico.findUnique.mockResolvedValue(null);

      await expect(service.solicitarAprovacao('os-inexistente')).rejects.toThrow(
        NotFoundException,
      );
      expect(emailMock.enviarOrcamento).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando o status não é em_diagnostico', async () => {
      prismaMock.ordemServico.findUnique.mockResolvedValue({
        ...osMock,
        status: 'recebida',
      });

      await expect(service.solicitarAprovacao('os-uuid-1234')).rejects.toThrow(
        BadRequestException,
      );
      expect(emailMock.enviarOrcamento).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando o cliente não tem e-mail', async () => {
      prismaMock.ordemServico.findUnique.mockResolvedValue({
        ...osMock,
        cliente: { ...clienteMock, email: null },
      });

      await expect(service.solicitarAprovacao('os-uuid-1234')).rejects.toThrow(
        BadRequestException,
      );
      expect(emailMock.enviarOrcamento).not.toHaveBeenCalled();
    });

    it('deve criar token, atualizar status e enviar e-mail', async () => {
      prismaMock.ordemServico.findUnique.mockResolvedValue(osMock);
      prismaMock.$transaction.mockResolvedValue([]);
      emailMock.enviarOrcamento.mockResolvedValue(undefined);

      await service.solicitarAprovacao('os-uuid-1234');

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(emailMock.enviarOrcamento).toHaveBeenCalledTimes(1);

      const emailArgs = emailMock.enviarOrcamento.mock.calls[0][0];
      expect(emailArgs.emailCliente).toBe('joao@email.com');
      expect(emailArgs.nomeCliente).toBe('João Silva');
      expect(emailArgs.osId).toBe('os-uuid-1234');
      expect(emailArgs.linkAprovar).toContain('acao=aprovar');
      expect(emailArgs.linkRejeitar).toContain('acao=rejeitar');
    });
  });

  // ─── validarToken ────────────────────────────────────────────────────────

  describe('validarToken', () => {
    it('deve lançar BadRequestException quando o token não existe', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue(null);

      await expect(service.validarToken('token-invalido')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar GoneException quando o token já foi utilizado', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue({
        ...tokenMock,
        usedAt: new Date(),
      });

      await expect(service.validarToken('uuid-token-valido')).rejects.toThrow(
        GoneException,
      );
    });

    it('deve lançar GoneException quando o token expirou', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue({
        ...tokenMock,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.validarToken('uuid-token-valido')).rejects.toThrow(
        GoneException,
      );
    });

    it('deve retornar o registro quando o token é válido', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue(tokenMock);

      const resultado = await service.validarToken('uuid-token-valido');

      expect(resultado).toBe(tokenMock);
    });
  });

  // ─── processarAprovacao ──────────────────────────────────────────────────

  describe('processarAprovacao', () => {
    beforeEach(() => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue(tokenMock);
      prismaMock.$transaction.mockResolvedValue([]);
    });

    it('deve atualizar status para em_execucao quando acao é aprovar', async () => {
      const resultado = await service.processarAprovacao(
        'uuid-token-valido',
        'aprovar',
      );

      expect(resultado.status).toBe('em_execucao');
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('deve atualizar status para rejeitada quando acao é rejeitar', async () => {
      const resultado = await service.processarAprovacao(
        'uuid-token-valido',
        'rejeitar',
      );

      expect(resultado.status).toBe('rejeitada');
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro se o token for inválido', async () => {
      prismaMock.tokenAprovacao.findUnique.mockResolvedValue(null);

      await expect(
        service.processarAprovacao('token-ruim', 'aprovar'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
