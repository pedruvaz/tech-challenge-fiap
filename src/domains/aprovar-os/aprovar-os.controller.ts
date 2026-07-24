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
    const texto = acao === 'aprovar' ? 'aprovar' : 'rejeitar';
    const cor = acao === 'aprovar' ? '#16a34a' : '#dc2626';

    return `
      <html><body style="font-family:Arial;text-align:center;padding:50px;">
        <h2>Confirmar ${texto} orçamento?</h2>
        <p>Valor: R$ ${Number(registro.ordemServico.valorFinal).toFixed(2)}</p>
        <form method="POST" action="/aprovacao/processar?token=${token}&acao=${acao}">
          <button type="submit" style="background:${cor};color:#fff;padding:12px 24px;border:none;border-radius:6px;font-size:16px;">
            Confirmar ${texto}
          </button>
        </form>
      </body></html>
    `;
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
    return `<html><body style="text-align:center;padding:50px;"><h2>OS atualizada com sucesso! Status: ${os.status}</h2></body></html>`;
  }
}
