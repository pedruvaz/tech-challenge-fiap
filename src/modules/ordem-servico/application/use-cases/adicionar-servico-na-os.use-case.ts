import { OrdemServico } from '../../domain/entities/ordem-servico.entity';
import { ServicoRealizado } from '../../domain/entities/servico-realizado.entity';
import { OsNaoEncontradaException } from '../../domain/exceptions/os-nao-encontrada.exception';
import { ServicoNaoEncontradoException } from '../../domain/exceptions/recurso-nao-encontrado.exception';
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository';
import { ServicoRepository } from '../../domain/repositories/servico.repository';
import { UnitOfWork } from '../../domain/repositories/unit-of-work';

export type AdicionarServicoNaOsInput = {
  osId: string;
  servicoId: number;
  quantidade: number;
};

export class AdicionarServicoNaOsUseCase {
  constructor(
    private readonly osRepo: OrdemServicoRepository,
    private readonly servicoRepo: ServicoRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async executar(input: AdicionarServicoNaOsInput): Promise<OrdemServico> {
    const os = await this.osRepo.buscarPorId(input.osId);
    if (!os) throw new OsNaoEncontradaException(input.osId);

    const servico = await this.servicoRepo.buscarPorId(input.servicoId);
    if (!servico) throw new ServicoNaoEncontradoException(input.servicoId);

    os.aplicarServico(
      new ServicoRealizado(servico.servicoId, input.quantidade, servico.valor),
    );

    await this.uow.executar(async () => {
      await this.osRepo.salvar(os);
    });

    return (await this.osRepo.buscarPorId(input.osId)) ?? os;
  }
}
