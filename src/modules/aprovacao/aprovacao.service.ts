import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { randomUUID } from 'crypto';
import { EmailService } from '../../libs/email/email.service';
import { PrismaService } from '../../prisma/prisma.service';

type TokenComRelacoes = Prisma.TokenAprovacaoGetPayload<{
  include: { ordemServico: { include: { cliente: true } } };
}>;

@Injectable()
export class AprovacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async solicitarAprovacao(osId: string): Promise<void> {
    const os = await this.prisma.ordemServico.findUnique({
      where: { osId },
      include: { cliente: true },
    });

    if (!os) {
      throw new NotFoundException(`Ordem de serviço '${osId}' não encontrada`);
    }

    if (os.status !== 'em_diagnostico') {
      throw new BadRequestException(
        `Só é possível solicitar aprovação quando o status é 'em_diagnostico'. Status atual: '${os.status}'`,
      );
    }

    if (!os.cliente.email) {
      throw new BadRequestException('Cliente não possui e-mail cadastrado');
    }

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.$transaction([
      this.prisma.tokenAprovacao.create({
        data: {
          token,
          ordemServicoId: os.osId,
          emailCliente: os.cliente.email,
          expiresAt,
        },
      }),
      this.prisma.ordemServico.update({
        where: { osId },
        data: { status: 'aguardando_aprovacao' },
      }),
      this.prisma.historicoStatusOrdemServico.create({
        data: {
          osId,
          statusAnterior: os.status,
          statusNovo: 'aguardando_aprovacao',
        },
      }),
    ]);

    const baseUrl = process.env.APP_URL;

    await this.emailService.enviarOrcamento({
      emailCliente: os.cliente.email,
      nomeCliente: os.cliente.nome,
      osId: os.osId,
      valorFinal: Number(os.valorFinal),
      linkAprovar: `${baseUrl}/aprovacao/confirmar?token=${token}&acao=aprovar`,
      linkRejeitar: `${baseUrl}/aprovacao/confirmar?token=${token}&acao=rejeitar`,
    });
  }

  async validarToken(token: string): Promise<TokenComRelacoes> {
    const registro = await this.prisma.tokenAprovacao.findUnique({
      where: { token },
      include: { ordemServico: { include: { cliente: true } } },
    });

    if (!registro) throw new BadRequestException('Token inválido');
    if (registro.usedAt) throw new GoneException('Este link já foi utilizado');
    if (registro.expiresAt < new Date())
      throw new GoneException('Link expirado');

    return registro;
  }

  async processarAprovacao(token: string, acao: 'aprovar' | 'rejeitar') {
    const registro = await this.validarToken(token);

    if (registro.ordemServico.status !== 'aguardando_aprovacao') {
      throw new ConflictException(
        `Esta OS não está mais aguardando aprovação (status atual: '${registro.ordemServico.status}').`,
      );
    }

    const novoStatus: Status = acao === 'aprovar' ? 'em_execucao' : 'rejeitada';

    await this.prisma.$transaction([
      this.prisma.tokenAprovacao.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
      this.prisma.ordemServico.update({
        where: { osId: registro.ordemServicoId },
        data: { status: novoStatus },
      }),
      this.prisma.historicoStatusOrdemServico.create({
        data: {
          osId: registro.ordemServicoId,
          statusAnterior: registro.ordemServico.status,
          statusNovo: novoStatus,
        },
      }),
    ]);

    return { ...registro.ordemServico, status: novoStatus };
  }
}
