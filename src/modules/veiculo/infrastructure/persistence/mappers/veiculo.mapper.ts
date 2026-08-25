import { Veiculo as VeiculoPrisma } from '@prisma/client';
import { Veiculo } from '../../../domain/entities/veiculo.entity';
import { Placa } from '../../../domain/value-objects/placa.vo';

export function reconstituirVeiculo(raw: VeiculoPrisma): Veiculo {
  return Veiculo.reconstituir({
    veiculoId: raw.veiculoId,
    placa: Placa.reconstituir(raw.placa),
    marca: raw.marca,
    modelo: raw.modelo,
    ano: raw.ano,
    cor: raw.cor,
    criadoEm: raw.criadoEm,
    atualizadoEm: raw.atualizadoEm,
    deletadoEm: raw.deletadoEm,
  });
}
