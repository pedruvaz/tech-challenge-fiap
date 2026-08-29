import { BadRequestException, GoneException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AprovacaoController } from './aprovacao.controller';
import { AprovacaoService } from './aprovacao.service';

describe('AprovacaoController', () => {
  let controller: AprovacaoController;

  const tokenRegistroMock = {
    token: 'uuid-token-valido',
    ordemServicoId: 'os-uuid-1234',
    ordemServico: {
      osId: 'os-uuid-1234',
      status: 'aguardando_aprovacao',
      valorFinal: 1500,
      cliente: { nome: 'João Silva' },
    },
  };

  const osMock = {
    osId: 'os-uuid-1234',
    status: 'em_execucao',
    valorFinal: 1500,
  };

  const serviceMock = {
    solicitarAprovacao: jest.fn(),
    validarToken: jest.fn(),
    processarAprovacao: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AprovacaoController],
      providers: [{ provide: AprovacaoService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AprovacaoController>(AprovacaoController);
  });

  // ─── solicitarAprovacao ───────────────────────────────────────────────────

  describe('solicitarAprovacao', () => {
    it('deve chamar o service e não retornar conteúdo', async () => {
      serviceMock.solicitarAprovacao.mockResolvedValue(undefined);

      const resultado = await controller.solicitarAprovacao('os-uuid-1234');

      expect(serviceMock.solicitarAprovacao).toHaveBeenCalledWith('os-uuid-1234');
      expect(resultado).toBeUndefined();
    });

    it('deve propagar BadRequestException do service', async () => {
      serviceMock.solicitarAprovacao.mockRejectedValue(
        new BadRequestException('Cliente sem e-mail'),
      );

      await expect(
        controller.solicitarAprovacao('os-uuid-1234'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── telaConfirmacao ─────────────────────────────────────────────────────

  describe('telaConfirmacao', () => {
    it('deve retornar HTML contendo nome do cliente e dados da OS para acao aprovar', async () => {
      serviceMock.validarToken.mockResolvedValue(tokenRegistroMock);

      const html = await controller.telaConfirmacao('uuid-token-valido', 'aprovar');

      expect(typeof html).toBe('string');
      expect(html).toContain('João Silva');
      expect(html).toContain('OS-UUID-');
      expect(html).toContain('1.500,00');
      expect(html).toContain('Aprovar');
      expect(html).toContain('/aprovacao/processar');
    });

    it('deve retornar HTML com opção de rejeitar', async () => {
      serviceMock.validarToken.mockResolvedValue(tokenRegistroMock);

      const html = await controller.telaConfirmacao('uuid-token-valido', 'rejeitar');

      expect(html).toContain('Rejeitar');
      expect(html).toContain('acao=rejeitar');
    });

    it('deve propagar GoneException quando o token expirou', async () => {
      serviceMock.validarToken.mockRejectedValue(new GoneException('Link expirado'));

      await expect(
        controller.telaConfirmacao('token-expirado', 'aprovar'),
      ).rejects.toThrow(GoneException);
    });
  });

  // ─── processar ───────────────────────────────────────────────────────────

  describe('processar', () => {
    it('deve retornar HTML de confirmação de aprovação', async () => {
      serviceMock.processarAprovacao.mockResolvedValue(osMock);

      const html = await controller.processar('uuid-token-valido', 'aprovar');

      expect(typeof html).toBe('string');
      expect(html).toContain('Aprovado');
      expect(html).toContain('OS-UUID-');
      expect(html).toContain('1.500,00');
    });

    it('deve retornar HTML de confirmação de rejeição', async () => {
      serviceMock.processarAprovacao.mockResolvedValue({
        ...osMock,
        status: 'rejeitada',
      });

      const html = await controller.processar('uuid-token-valido', 'rejeitar');

      expect(html).toContain('Rejeitado');
      expect(html).toContain('rejeitada');
    });

    it('deve propagar GoneException quando o token já foi usado', async () => {
      serviceMock.processarAprovacao.mockRejectedValue(
        new GoneException('Este link já foi utilizado'),
      );

      await expect(
        controller.processar('token-usado', 'aprovar'),
      ).rejects.toThrow(GoneException);
    });
  });
});
