import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private get resend() {
    return new Resend(process.env.RESEND_API_KEY);
  }

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
    const valor = p.valorFinal.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
    });
    const osIdCurto = p.osId.slice(0, 8).toUpperCase();

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#93c5fd;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Oficina Mecânica</p>
            <h1 style="margin:8px 0 0;font-size:26px;color:#ffffff;font-weight:700;">Orçamento Disponível</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 0;">
            <p style="margin:0 0 8px;font-size:16px;color:#374151;">Olá, <strong>${p.nomeCliente}</strong>!</p>
            <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
              O orçamento da sua Ordem de Serviço foi elaborado e está aguardando a sua aprovação. Confira os detalhes abaixo.
            </p>

            <!-- OS card -->
            <table role="presentation" width="100%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:28px;">
              <tr>
                <td style="padding:24px 28px;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td style="padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
                        <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Ordem de Serviço</p>
                        <p style="margin:4px 0 0;font-size:16px;color:#1e293b;font-weight:700;font-family:monospace;">#${osIdCurto}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top:16px;">
                        <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Valor Total do Orçamento</p>
                        <p style="margin:6px 0 0;font-size:32px;color:#1e293b;font-weight:800;">R$ ${valor}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;">
              Clique em um dos botões abaixo para responder:
            </p>

            <!-- CTA buttons -->
            <table role="presentation" width="100%" style="margin-bottom:32px;">
              <tr>
                <td align="center" style="padding:0 8px 0 0;" width="50%">
                  <a href="${p.linkAprovar}" style="display:block;background:#16a34a;color:#ffffff;text-decoration:none;padding:16px 12px;border-radius:8px;font-size:16px;font-weight:700;text-align:center;letter-spacing:0.3px;">
                    ✓ Aprovar Orçamento
                  </a>
                </td>
                <td align="center" style="padding:0 0 0 8px;" width="50%">
                  <a href="${p.linkRejeitar}" style="display:block;background:#ffffff;color:#dc2626;text-decoration:none;padding:14px 12px;border-radius:8px;font-size:16px;font-weight:700;text-align:center;border:2px solid #dc2626;letter-spacing:0.3px;">
                    ✕ Rejeitar
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 40px 36px;">
            <div style="border-top:1px solid #e2e8f0;padding-top:20px;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;text-align:center;">
                &#128274; Este link é válido por <strong>7 dias</strong> e pode ser usado apenas uma vez.
              </p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;text-align:center;">
                Se você não solicitou este orçamento, ignore este e-mail.
              </p>
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }
}
