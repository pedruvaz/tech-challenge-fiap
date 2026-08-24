import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';

export class RemoverOrdemServicoUseCase {
  constructor(
    private readonly osRepo: OrdemServicoRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async executar(osId: string): Promise<void> {
    const os = await this.osRepo.buscarPorId(osId);
    if (!os) throw new OsNaoEncontradaException(osId);

    os.softDelete();

    await this.uow.executar(async () => {
      await this.osRepo.salvar(os);
    });
  }
}
