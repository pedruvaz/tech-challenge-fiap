import { Veiculo } from '../entities/veiculo.entity';

export abstract class VeiculoRepository {
  abstract salvar(veiculo: Veiculo): Promise<void>;
  abstract buscarPorId(veiculoId: string): Promise<Veiculo | null>;
  abstract listar(): Promise<Veiculo[]>;
  abstract existeComPlaca(
    placa: string,
    ignorarVeiculoId?: string,
  ): Promise<boolean>;
}
