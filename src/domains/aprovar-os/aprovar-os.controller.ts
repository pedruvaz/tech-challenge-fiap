// src/aprovacao/aprovacao.controller.ts
import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AprovacaoService } from './aprovar-os.service';

@ApiTags('aprovacao')
@Controller('aprovacao')
export class AprovacaoController {
  constructor(private aprovacaoService: AprovacaoService) {}

  @Post(':osId/solicitar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Solicitar aprovação do orçamento ao cliente via e-mail',
    description:
      'Envia um e-mail ao cliente com links para aprovar ou rejeitar o orçamento. A OS deve estar no status `em_diagnostico` e o cliente deve ter e-mail cadastrado.',
  })
  @ApiParam({ name: 'osId', type: String, description: 'ID da ordem de serviço' })
  @ApiNoContentResponse({ description: 'E-mail enviado com sucesso' })
  @ApiResponse({ status: 400, description: 'Status inválido ou cliente sem e-mail' })
  @ApiResponse({ status: 404, description: 'Ordem de serviço não encontrada' })
  async solicitarAprovacao(@Param('osId') osId: string): Promise<void> {
    await this.aprovacaoService.solicitarAprovacao(osId);
  }

  @Get('confirmar')
  @Header('Content-Type', 'text/html')
  @ApiOperation({
    summary: 'Página de confirmação (link do e-mail do cliente)',
    description: 'Exibe uma página HTML para o cliente confirmar a ação antes de processar.',
  })
  @ApiQuery({ name: 'token', type: String, description: 'Token de aprovação recebido por e-mail' })
  @ApiQuery({ name: 'acao', enum: ['aprovar', 'rejeitar'], description: 'Ação desejada' })
  @ApiResponse({ status: 200, description: 'Página HTML de confirmação' })
  @ApiResponse({ status: 400, description: 'Token inválido' })
  @ApiResponse({ status: 410, description: 'Token expirado ou já utilizado' })
  async telaConfirmacao(
    @Query('token') token: string,
    @Query('acao') acao: 'aprovar' | 'rejeitar',
  ): Promise<string> {
    const registro = await this.aprovacaoService.validarToken(token);
    const { ordemServico } = registro;
    const nomeCliente = ordemServico.cliente.nome;
    const valor = Number(ordemServico.valorFinal).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const osIdCurto = ordemServico.osId.slice(0, 8).toUpperCase();

    const aprovando = acao === 'aprovar';
    const acaoLabel = aprovando ? 'Aprovar Orçamento' : 'Rejeitar Orçamento';
    const acaoCor = aprovando ? '#16a34a' : '#dc2626';
    const acaoCorBg = aprovando ? '#f0fdf4' : '#fef2f2';
    const acaoCorBorda = aprovando ? '#bbf7d0' : '#fecaca';
    const acaoIcone = aprovando ? '✓' : '✕';
    const acaoDescricao = aprovando
      ? 'Ao confirmar, a oficina iniciará a execução dos serviços.'
      : 'Ao confirmar, o orçamento será cancelado.';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${acaoLabel}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #f4f6f8; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); max-width: 480px; width: 100%; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 28px 32px; text-align: center; }
    .header .label { font-size: 11px; color: #93c5fd; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
    .header h1 { font-size: 22px; color: #fff; font-weight: 700; margin-top: 6px; }
    .body { padding: 32px; }
    .greeting { font-size: 15px; color: #374151; margin-bottom: 6px; }
    .question { font-size: 18px; color: #111827; font-weight: 700; margin-bottom: 24px; }
    .os-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin-bottom: 20px; }
    .os-card .field-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .os-card .field-value { font-size: 15px; color: #1e293b; font-weight: 700; margin-top: 4px; margin-bottom: 14px; font-family: monospace; }
    .os-card .valor { font-size: 30px; color: #1e293b; font-weight: 800; font-family: Arial, sans-serif; }
    .action-box { background: ${acaoCorBg}; border: 1px solid ${acaoCorBorda}; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
    .action-box p { font-size: 13px; color: #4b5563; line-height: 1.5; }
    .btn-confirm { display: block; width: 100%; background: ${acaoCor}; color: #fff; border: none; border-radius: 10px; padding: 16px; font-size: 17px; font-weight: 700; cursor: pointer; letter-spacing: 0.3px; }
    .btn-confirm:hover { opacity: 0.9; }
    .footer { padding: 0 32px 28px; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p class="label">Oficina Mecânica</p>
      <h1>${acaoIcone} ${acaoLabel}</h1>
    </div>
    <div class="body">
      <p class="greeting">Olá, <strong>${nomeCliente}</strong>!</p>
      <p class="question">Você deseja <u>${acao === 'aprovar' ? 'aprovar' : 'rejeitar'}</u> o seguinte orçamento?</p>

      <div class="os-card">
        <p class="field-label">Ordem de Serviço</p>
        <p class="field-value">#${osIdCurto}</p>
        <p class="field-label">Valor Total</p>
        <p class="valor">R$ ${valor}</p>
      </div>

      <div class="action-box">
        <p>${acaoDescricao}</p>
      </div>

      <form method="POST" action="/aprovacao/processar?token=${token}&acao=${acao}">
        <button type="submit" class="btn-confirm">${acaoIcone} Confirmar ${acao === 'aprovar' ? 'Aprovação' : 'Rejeição'}</button>
      </form>
    </div>
    <div class="footer">
      <p>&#128274; Ação irreversível. Este link pode ser usado apenas uma vez.</p>
    </div>
  </div>
</body>
</html>`;
  }

  @Post('processar')
  @Header('Content-Type', 'text/html')
  @ApiOperation({
    summary: 'Processa aprovação ou rejeição via token (submit do cliente)',
    description: 'Endpoint chamado pelo formulário da página de confirmação. Invalida o token e atualiza o status da OS.',
  })
  @ApiQuery({ name: 'token', type: String, description: 'Token de aprovação recebido por e-mail' })
  @ApiQuery({ name: 'acao', enum: ['aprovar', 'rejeitar'], description: 'Ação confirmada pelo cliente' })
  @ApiResponse({ status: 200, description: 'OS atualizada — página HTML de feedback' })
  @ApiResponse({ status: 400, description: 'Token inválido' })
  @ApiResponse({ status: 410, description: 'Token expirado ou já utilizado' })
  async processar(
    @Query('token') token: string,
    @Query('acao') acao: 'aprovar' | 'rejeitar',
  ): Promise<string> {
    const os = await this.aprovacaoService.processarAprovacao(token, acao);
    const aprovado = acao === 'aprovar';
    const valor = Number(os.valorFinal).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const osIdCurto = os.osId.slice(0, 8).toUpperCase();

    const corPrincipal = aprovado ? '#16a34a' : '#dc2626';
    const corBg = aprovado ? '#f0fdf4' : '#fef2f2';
    const corBorda = aprovado ? '#bbf7d0' : '#fecaca';
    const icone = aprovado ? '✓' : '✕';
    const titulo = aprovado ? 'Orçamento Aprovado!' : 'Orçamento Rejeitado';
    const mensagem = aprovado
      ? 'Ótimo! Recebemos sua aprovação. Nossa equipe já foi notificada e em breve iniciará os serviços no seu veículo.'
      : 'Entendemos. O orçamento foi cancelado. Caso queira discutir alternativas, entre em contato com a oficina.';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${titulo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; background: #f4f6f8; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); max-width: 480px; width: 100%; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 28px 32px; text-align: center; }
    .header .label { font-size: 11px; color: #93c5fd; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; }
    .header h1 { font-size: 22px; color: #fff; font-weight: 700; margin-top: 6px; }
    .body { padding: 36px 32px 28px; text-align: center; }
    .icon-circle { width: 80px; height: 80px; border-radius: 50%; background: ${corBg}; border: 3px solid ${corBorda}; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 36px; color: ${corPrincipal}; line-height: 80px; }
    .titulo { font-size: 22px; color: #111827; font-weight: 800; margin-bottom: 12px; }
    .mensagem { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 28px; }
    .os-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px 22px; text-align: left; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .row:last-child { border-bottom: none; padding-bottom: 0; }
    .row .key { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }
    .row .val { font-size: 14px; color: #1e293b; font-weight: 700; }
    .row .val.valor { font-size: 18px; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; color: ${corPrincipal}; background: ${corBg}; border: 1px solid ${corBorda}; }
    .footer { padding: 0 32px 28px; text-align: center; }
    .footer p { font-size: 12px; color: #cbd5e1; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p class="label">Oficina Mecânica</p>
      <h1>Resposta Registrada</h1>
    </div>
    <div class="body">
      <div class="icon-circle">${icone}</div>
      <h2 class="titulo">${titulo}</h2>
      <p class="mensagem">${mensagem}</p>

      <div class="os-card">
        <div class="row">
          <span class="key">OS</span>
          <span class="val">#${osIdCurto}</span>
        </div>
        <div class="row">
          <span class="key">Valor</span>
          <span class="val valor">R$ ${valor}</span>
        </div>
        <div class="row">
          <span class="key">Status</span>
          <span class="status-badge">${os.status.replace(/_/g, ' ')}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Você já pode fechar esta página.</p>
    </div>
  </div>
</body>
</html>`;
  }
}
