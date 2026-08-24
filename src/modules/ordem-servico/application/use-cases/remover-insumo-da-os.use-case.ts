import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import {
  InsumoNaoAssociadoException,
  InsumoNaoEncontradoException,
} from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';

export type RemoverInsumoDaOsInput = {
  osId: string;
  insumoId: number;
};

export class RemoverInsumoDaOsUseCase {
  constructor(
    private readonly osRepo: OrdemServicoRepository,
    private readonly insumoRepo: InsumoRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async executar(input: RemoverInsumoDaOsInput): Promise<OrdemServico> {
    const os = await this.osRepo.buscarPorId(input.osId);
    if (!os) throw new OsNaoEncontradaException(input.osId);

    const qtdAtual = os.quantidadeDeInsumo(input.insumoId);
    if (qtdAtual === 0) {
      throw new InsumoNaoAssociadoException(input.insumoId, input.osId);
    }

    const insumo = await this.insumoRepo.buscarPorId(input.insumoId);
    if (!insumo) throw new InsumoNaoEncontradoException(input.insumoId);

    insumo.ajustarEstoque(-qtdAtual);
    os.removerInsumo(input.insumoId);

    await this.uow.executar(async () => {
      await this.insumoRepo.salvar(insumo);
      await this.osRepo.salvar(os);
    });

    return (await this.osRepo.buscarPorId(input.osId)) ?? os;
  }
}
