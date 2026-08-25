import { Veiculo } from '../../domain/entities/veiculo.entity';
import { VeiculoResponseDto } from './dtos/veiculo.response';

export class VeiculoPresenter {
  static apresentar(veiculo: Veiculo): VeiculoResponseDto {
    const dto = new VeiculoResponseDto();
    dto.veiculoId = veiculo.veiculoId;
    dto.placa = veiculo.placa.valor;
    dto.marca = veiculo.marca;
    dto.modelo = veiculo.modelo;
    dto.ano = veiculo.ano;
    dto.cor = veiculo.cor;
    dto.criadoEm = veiculo.criadoEm;
    dto.atualizadoEm = veiculo.atualizadoEm;
    return dto;
  }

  static apresentarLista(veiculos: Veiculo[]): VeiculoResponseDto[] {
    return veiculos.map((v) => VeiculoPresenter.apresentar(v));
  }
}
