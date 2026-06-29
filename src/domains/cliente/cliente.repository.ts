import { Injectable } from '@nestjs/common';
import { Cliente, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

// Traz os veículos vinculados (apenas os não deletados) junto do cliente,
// resolvendo o N:N veiculo_cliente até o registro do veículo.
const incluiVeiculos = {
  veiculos: {
    where: { veiculo: { deletadoEm: null } },
    include: { veiculo: true },
  },
} satisfies Prisma.ClienteInclude;

export type ClienteComVeiculos = Prisma.ClienteGetPayload<{
  include: typeof incluiVeiculos;
}>;

@Injectable()
export class ClienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateClienteDto): Promise<Cliente> {
    return this.prisma.cliente.create({ data });
  }

  findAll(): Promise<ClienteComVeiculos[]> {
    return this.prisma.cliente.findMany({
      where: { deletadoEm: null },
      orderBy: { clienteId: 'asc' },
      include: incluiVeiculos,
    });
  }

  findById(clienteId: string): Promise<ClienteComVeiculos | null> {
    return this.prisma.cliente.findFirst({
      where: { clienteId, deletadoEm: null },
      include: incluiVeiculos,
    });
  }

  findByNumDocumento(numDocumento: string): Promise<Cliente | null> {
    return this.prisma.cliente.findFirst({
      where: { numDocumento, deletadoEm: null },
    });
  }

  update(clienteId: string, data: UpdateClienteDto): Promise<Cliente> {
    return this.prisma.cliente.update({
      where: { clienteId },
      data,
    });
  }

  softDelete(clienteId: string): Promise<Cliente> {
    return this.prisma.cliente.update({
      where: { clienteId },
      data: { deletadoEm: new Date() },
    });
  }
}
