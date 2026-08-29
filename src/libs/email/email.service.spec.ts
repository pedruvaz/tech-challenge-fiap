import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

describe('EmailService', () => {
  let service: EmailService;

  const params = {
    emailCliente: 'cliente@email.com',
    nomeCliente: 'João Silva',
    osId: 'abcdef12-0000-0000-0000-000000000000',
    valorFinal: 1500.5,
    linkAprovar: 'http://localhost:3000/aprovacao/confirmar?token=tok&acao=aprovar',
    linkRejeitar: 'http://localhost:3000/aprovacao/confirmar?token=tok&acao=rejeitar',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('deve enviar e-mail com os parâmetros corretos', async () => {
    sendMock.mockResolvedValue({ id: 'email-id-123' });

    await service.enviarOrcamento(params);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const chamada = sendMock.mock.calls[0][0];
    expect(chamada.to).toBe(params.emailCliente);
    expect(chamada.subject).toContain('Orçamento');
    expect(chamada.html).toContain('João Silva');
    expect(chamada.html).toContain('ABCDEF12');
    expect(chamada.html).toContain('1.500,50');
    expect(chamada.html).toContain(params.linkAprovar);
    expect(chamada.html).toContain(params.linkRejeitar);
  });

  it('deve usar EMAIL_FROM do ambiente quando definido', async () => {
    process.env.EMAIL_FROM = 'Oficina <oficina@teste.com>';
    sendMock.mockResolvedValue({ id: 'email-id-123' });

    await service.enviarOrcamento(params);

    expect(sendMock.mock.calls[0][0].from).toBe('Oficina <oficina@teste.com>');
    delete process.env.EMAIL_FROM;
  });

  it('deve usar remetente padrão quando EMAIL_FROM não está definido', async () => {
    delete process.env.EMAIL_FROM;
    sendMock.mockResolvedValue({ id: 'email-id-123' });

    await service.enviarOrcamento(params);

    expect(sendMock.mock.calls[0][0].from).toBe('Oficina <onboarding@resend.dev>');
  });

  it('deve propagar erro se o Resend falhar', async () => {
    sendMock.mockRejectedValue(new Error('Resend API indisponível'));

    await expect(service.enviarOrcamento(params)).rejects.toThrow('Resend API indisponível');
  });
});
