import { Prisma } from '@prisma/client';
import { Cliente } from '../../../domain/entities/cliente.entity';
import { VeiculoVinculado } from '../../../domain/entities/veiculo-vinculado.entity';
import { DocumentoCliente } from '../../../domain/value-objects/documento-cliente.vo';
import { TipoCliente } from '../../../domain/value-objects/tipo-cliente.vo';

const incluiVeiculos = {
  veiculos: {
    where: { veiculo: { deletadoEm: null } },
    include: { veiculo: true },
  },
} satisfies Prisma.ClienteInclude;

export const clienteInclude = incluiVeiculos;

type Raw = Prisma.ClienteGetPayload<{ include: typeof incluiVeiculos }>;

export function reconstituirCliente(raw: Raw): Cliente {
  return Cliente.reconstituir({
    clienteId: raw.clienteId,
    nome: raw.nome,
    telefone: raw.telefone,
    documento: DocumentoCliente.reconstituir(raw.numDocumento),
    tipo: TipoCliente.de(raw.tipo),
    criadoEm: raw.criadoEm,
    atualizadoEm: raw.atualizadoEm,
    deletadoEm: raw.deletadoEm,
    veiculos: raw.veiculos.map(
      (v) =>
        new VeiculoVinculado(
          v.veiculo.veiculoId,
          v.veiculo.placa,
          v.veiculo.marca,
          v.veiculo.modelo,
          v.veiculo.ano,
          v.veiculo.cor,
          v.veiculo.criadoEm,
          v.veiculo.atualizadoEm,
          v.veiculo.deletadoEm,
        ),
    ),
  });
}
