import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { PecaUtilizada } from '../../domain/entities/peca-utilizada.entity';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { PecaNaoEncontradaException } from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { PecaRepository } from '../../domain/repositories/peca.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';

export type AdicionarPecaNaOsInput = {
  osId: string;
  pecaId: number;
  qtd: number;
};

export class AdicionarPecaNaOsUseCase {
  constructor(
    private readonly osRepo: OrdemServicoRepository,
    private readonly pecaRepo: PecaRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async executar(input: AdicionarPecaNaOsInput): Promise<OrdemServico> {
    const os = await this.osRepo.buscarPorId(input.osId);
    if (!os) throw new OsNaoEncontradaException(input.osId);

    const peca = await this.pecaRepo.buscarPorId(input.pecaId);
    if (!peca) throw new PecaNaoEncontradaException(input.pecaId);

    const delta = input.qtd - os.quantidadeDePeca(input.pecaId);
    peca.ajustarEstoque(delta);

    os.aplicarPeca(new PecaUtilizada(peca.pecaId, input.qtd, peca.valorUn));

    await this.uow.executar(async () => {
      await this.pecaRepo.salvar(peca);
      await this.osRepo.salvar(os);
    });

    return (await this.osRepo.buscarPorId(input.osId)) ?? os;
  }
}
