import { InsumoConsumido } from '../../domain/entities/insumo-consumido.entity';
import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { InsumoNaoEncontradoException } from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';

export type AdicionarInsumoNaOsInput = {
  osId: string;
  insumoId: number;
  qtdConsumida: number;
};

export class AdicionarInsumoNaOsUseCase {
  constructor(
    private readonly osRepo: OrdemServicoRepository,
    private readonly insumoRepo: InsumoRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async executar(input: AdicionarInsumoNaOsInput): Promise<OrdemServico> {
    const os = await this.osRepo.buscarPorId(input.osId);
    if (!os) throw new OsNaoEncontradaException(input.osId);

    const insumo = await this.insumoRepo.buscarPorId(input.insumoId);
    if (!insumo) throw new InsumoNaoEncontradoException(input.insumoId);

    const delta = input.qtdConsumida - os.quantidadeDeInsumo(input.insumoId);
    insumo.ajustarEstoque(delta);

    os.aplicarInsumo(
      new InsumoConsumido(insumo.insumoId, input.qtdConsumida, insumo.valorUn),
    );

    await this.uow.executar(async () => {
      await this.insumoRepo.salvar(insumo);
      await this.osRepo.salvar(os);
    });

    return (await this.osRepo.buscarPorId(input.osId)) ?? os;
  }
}
