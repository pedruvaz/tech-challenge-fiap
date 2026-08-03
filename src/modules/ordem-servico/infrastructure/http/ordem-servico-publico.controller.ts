import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ConsultarOrdemServicoPublicaUseCase } from '../../application/use-cases/consultar-ordem-servico-publica.use-case';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { OrdemServicoViewRepository } from '../../domain/repositories/ordem-servico.view';
import { OrdemServicoResponseDto } from './dtos/ordem-servico.response';
import { OrdemServicoPresenter } from './ordem-servico.presenter';

@ApiTags('ordens-servico-publico')
@Controller('publico/ordens-servico')
export class OrdemServicoPublicoController {
  constructor(
    private readonly consultar: ConsultarOrdemServicoPublicaUseCase,
    private readonly view: OrdemServicoViewRepository,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary:
      'Consulta pública da OS pelo cliente (sem JWT). Exige o CPF/CNPJ do dono como prova de posse.',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({
    name: 'numDocumento',
    type: String,
    required: true,
    description: 'CPF/CNPJ do dono da OS (com ou sem máscara)',
  })
  @ApiOkResponse({ type: OrdemServicoResponseDto })
  async buscar(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('numDocumento') numDocumento?: string,
  ): Promise<OrdemServicoResponseDto> {
    if (!numDocumento || !numDocumento.trim()) {
      throw new BadRequestException("Query 'numDocumento' é obrigatória");
    }
    await this.consultar.executar({ osId: id, numDocumento });
    const view = await this.view.buscarPorId(id);
    if (!view) throw new OsNaoEncontradaException(id);
    return OrdemServicoPresenter.apresentar(view);
  }
}
