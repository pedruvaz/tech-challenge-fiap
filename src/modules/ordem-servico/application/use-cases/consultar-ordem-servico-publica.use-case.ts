import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { DocumentoNaoConfereException } from '../../domain/exceptions/documento-nao-confere.exception';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';

export type ConsultarOrdemServicoPublicaInput = {
  osId: string;
  numDocumento: string;
};

export class ConsultarOrdemServicoPublicaUseCase {
  constructor(
    private readonly osRepo: OrdemServicoRepository,
    private readonly clienteRepo: ClienteRepository,
  ) {}

  async executar(
    input: ConsultarOrdemServicoPublicaInput,
  ): Promise<OrdemServico> {
    const os = await this.osRepo.buscarPorId(input.osId);
    if (!os) throw new OsNaoEncontradaException(input.osId);

    const cliente = await this.clienteRepo.buscarPorId(os.clienteId);
    if (!cliente || !cliente.documentoConfereCom(input.numDocumento)) {
      throw new DocumentoNaoConfereException();
    }

    return os;
  }
}
