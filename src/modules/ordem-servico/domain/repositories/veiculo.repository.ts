import { Veiculo } from '../entities/veiculo.entity';

export abstract class VeiculoRepository {
  abstract buscarPorId(veiculoId: string): Promise<Veiculo | null>;
  abstract veiculoPertenceAoCliente(
    veiculoId: string,
    clienteId: string,
  ): Promise<boolean>;
}
