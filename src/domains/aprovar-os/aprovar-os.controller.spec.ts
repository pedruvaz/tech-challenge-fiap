import { Test, TestingModule } from '@nestjs/testing';
import { AprovacaoController } from './aprovar-os.controller';
import { AprovacaoService } from './aprovar-os.service';

describe('AprovacaoController', () => {
  let controller: AprovacaoController;

  const osMock = {
    osId: 'os-uuid-12345678',
    status: 'em_execucao',
    valorFinal: 500,
    cliente: {
      nome: 'João Silva',
      email: 'joao@email.com',
    },
  };

  const tokenRegistroMock = {
    token: 'token-uuid-1234',
    ordemServicoId: osMock.osId,
    ordemServico: osMock,
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

  describe('solicitarAprovacao', () => {
    it('deve chamar o service e retornar void', async () => {
      serviceMock.solicitarAprovacao.mockResolvedValue(undefined);

      await controller.solicitarAprovacao(osMock.osId);

      expect(serviceMock.solicitarAprovacao).toHaveBeenCalledWith(osMock.osId);
    });
  });

  describe('telaConfirmacao', () => {
    it('deve retornar HTML de confirmação para aprovação', async () => {
      serviceMock.validarToken.mockResolvedValue(tokenRegistroMock);

      const resultado = await controller.telaConfirmacao('token-uuid-1234', 'aprovar');

      expect(serviceMock.validarToken).toHaveBeenCalledWith('token-uuid-1234');
      expect(typeof resultado).toBe('string');
      expect(resultado).toContain('<!DOCTYPE html>');
      expect(resultado).toContain('Aprovar Orçamento');
      expect(resultado).toContain('João Silva');
    });

    it('deve retornar HTML de confirmação para rejeição', async () => {
      serviceMock.validarToken.mockResolvedValue(tokenRegistroMock);

      const resultado = await controller.telaConfirmacao('token-uuid-1234', 'rejeitar');

      expect(resultado).toContain('Rejeitar Orçamento');
    });
  });

  describe('processar', () => {
    it('deve retornar HTML de resultado para aprovação', async () => {
      serviceMock.processarAprovacao.mockResolvedValue({
        ...osMock,
        status: 'em_execucao',
      });

      const resultado = await controller.processar('token-uuid-1234', 'aprovar');

      expect(serviceMock.processarAprovacao).toHaveBeenCalledWith(
        'token-uuid-1234',
        'aprovar',
      );
      expect(typeof resultado).toBe('string');
      expect(resultado).toContain('<!DOCTYPE html>');
      expect(resultado).toContain('Orçamento Aprovado!');
    });

    it('deve retornar HTML de resultado para rejeição', async () => {
      serviceMock.processarAprovacao.mockResolvedValue({
        ...osMock,
        status: 'rejeitada',
      });

      const resultado = await controller.processar('token-uuid-1234', 'rejeitar');

      expect(resultado).toContain('Orçamento Rejeitado');
    });
  });
});
