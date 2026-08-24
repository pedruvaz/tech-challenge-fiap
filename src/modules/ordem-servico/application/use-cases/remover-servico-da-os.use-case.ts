import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { ServicoNaoAssociadoException } from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';

export type RemoverServicoDaOsInput = {
  osId: string;
  servicoId: number;
};

export class RemoverServicoDaOsUseCase {
  constructor(
    private readonly osRepo: OrdemServicoRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async executar(input: RemoverServicoDaOsInput): Promise<OrdemServico> {
    const os = await this.osRepo.buscarPorId(input.osId);
    if (!os) throw new OsNaoEncontradaException(input.osId);

    if (os.quantidadeDeServico(input.servicoId) === 0) {
      throw new ServicoNaoAssociadoException(input.servicoId, input.osId);
    }

    os.removerServico(input.servicoId);

    await this.uow.executar(async () => {
      await this.osRepo.salvar(os);
    });

    return (await this.osRepo.buscarPorId(input.osId)) ?? os;
  }
}
