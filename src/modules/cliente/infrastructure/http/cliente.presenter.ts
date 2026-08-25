import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteResponseDto } from './dtos/cliente.response';

export class ClientePresenter {
  static apresentar(cliente: Cliente): ClienteResponseDto {
    const dto = new ClienteResponseDto();
    dto.clienteId = cliente.clienteId;
    dto.numDocumento = cliente.documento.numero;
    dto.nome = cliente.nome;
    dto.telefone = cliente.telefone;
    dto.tipo = cliente.tipo.valor;
    dto.criadoEm = cliente.criadoEm;
    dto.atualizadoEm = cliente.atualizadoEm;
    dto.veiculos = cliente.veiculos.map((v) => ({
      veiculoId: v.veiculoId,
      placa: v.placa,
      marca: v.marca,
      modelo: v.modelo,
      ano: v.ano,
      cor: v.cor,
      criadoEm: v.criadoEm,
      atualizadoEm: v.atualizadoEm,
      deletadoEm: v.deletadoEm,
    }));
    return dto;
  }

  static apresentarLista(clientes: Cliente[]): ClienteResponseDto[] {
    return clientes.map((c) => ClientePresenter.apresentar(c));
  }
}
