import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import {
  PecaNaoAssociadaException,
  PecaNaoEncontradaException,
} from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { PecaRepository } from '../../domain/repositories/peca.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';

export type RemoverPecaDaOsInput = {
  osId: string;
  pecaId: number;
};

export class RemoverPecaDaOsUseCase {
  constructor(
    private readonly osRepo: OrdemServicoRepository,
    private readonly pecaRepo: PecaRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async executar(input: RemoverPecaDaOsInput): Promise<OrdemServico> {
    const os = await this.osRepo.buscarPorId(input.osId);
    if (!os) throw new OsNaoEncontradaException(input.osId);

    const qtdAtual = os.quantidadeDePeca(input.pecaId);
    if (qtdAtual === 0) {
      throw new PecaNaoAssociadaException(input.pecaId, input.osId);
    }

    const peca = await this.pecaRepo.buscarPorId(input.pecaId);
    if (!peca) throw new PecaNaoEncontradaException(input.pecaId);

    peca.ajustarEstoque(-qtdAtual);
    os.removerPeca(input.pecaId);

    await this.uow.executar(async () => {
      await this.pecaRepo.salvar(peca);
      await this.osRepo.salvar(os);
    });

    return (await this.osRepo.buscarPorId(input.osId)) ?? os;
  }
}
