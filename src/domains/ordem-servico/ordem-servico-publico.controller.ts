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
import { OrdemServicoResponseDto } from './dto/ordem-servico-response.dto';
import { OrdemServicoService } from './ordem-servico.service';

@ApiTags('ordens-servico-publico')
@Controller('publico/ordens-servico')
export class OrdemServicoPublicoController {
  constructor(private readonly service: OrdemServicoService) {}

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
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('numDocumento') numDocumento?: string,
  ): Promise<OrdemServicoResponseDto> {
    if (!numDocumento || !numDocumento.trim()) {
      throw new BadRequestException("Query 'numDocumento' é obrigatória");
    }
    return this.service.findByIdParaCliente(id, numDocumento);
  }
}
