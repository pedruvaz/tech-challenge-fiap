// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async enviarOrcamento(params: {
    emailCliente: string;
    nomeCliente: string;
    osId: string;
    valorFinal: number;
    linkAprovar: string;
    linkRejeitar: string;
  }) {
    await this.resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'Oficina <onboarding@resend.dev>',
      to: params.emailCliente,
      subject: `Orçamento da sua OS disponível para aprovação`,
      html: this.template(params),
    });
  }

  private template(p: {
    nomeCliente: string;
    osId: string;
    valorFinal: number;
    linkAprovar: string;
    linkRejeitar: string;
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Olá, ${p.nomeCliente}!</h2>
        <p>O orçamento da sua Ordem de Serviço está pronto.</p>
        <p style="font-size: 18px;"><strong>Valor: R$ ${p.valorFinal.toFixed(2)}</strong></p>
        <div style="margin: 30px 0;">
          <a href="${p.linkAprovar}" style="background:#16a34a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;margin-right:10px;">Aprovar Orçamento</a>
          <a href="${p.linkRejeitar}" style="background:#dc2626;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">Rejeitar</a>
        </div>
        <p style="color:#666;font-size:12px;">Este link expira em 7 dias.</p>
      </div>
    `;
  }
}
