import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';

export type AprovarOrcamentoInput = {
  osId: string;
  usuarioId?: number;
};

export class AprovarOrcamentoUseCase {
  constructor(
    private readonly osRepo: OrdemServicoRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async executar(input: AprovarOrcamentoInput): Promise<OrdemServico> {
    const os = await this.osRepo.buscarPorId(input.osId);
    if (!os) throw new OsNaoEncontradaException(input.osId);

    os.aprovarOrcamento(input.usuarioId);

    await this.uow.executar(async () => {
      await this.osRepo.salvar(os);
    });

    return (await this.osRepo.buscarPorId(input.osId)) ?? os;
  }
}
