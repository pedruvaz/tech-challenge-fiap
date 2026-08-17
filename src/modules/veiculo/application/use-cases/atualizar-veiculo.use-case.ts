import { Veiculo } from '../../domain/entities/veiculo.entity';
import { PlacaJaCadastradaException } from '../../domain/exceptions/placa-ja-cadastrada.exception';
import { VeiculoNaoEncontradoException } from '../../domain/exceptions/veiculo-nao-encontrado.exception';
import { VeiculoRepository } from '../../domain/repositories/veiculo.repository';

export type AtualizarVeiculoInput = {
  veiculoId: string;
  placa?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  cor?: string;
};

export class AtualizarVeiculoUseCase {
  constructor(private readonly repo: VeiculoRepository) {}

  async executar(input: AtualizarVeiculoInput): Promise<Veiculo> {
    const veiculo = await this.repo.buscarPorId(input.veiculoId);
    if (!veiculo) throw new VeiculoNaoEncontradoException(input.veiculoId);

    if (input.placa !== undefined) {
      const conflito = await this.repo.existeComPlaca(
        input.placa,
        input.veiculoId,
      );
      if (conflito) throw new PlacaJaCadastradaException();
    }

    veiculo.alterar({
      placa: input.placa,
      marca: input.marca,
      modelo: input.modelo,
      ano: input.ano,
      cor: input.cor,
    });

    await this.repo.salvar(veiculo);
    return (await this.repo.buscarPorId(veiculo.veiculoId)) ?? veiculo;
  }
}
