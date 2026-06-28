import { Injectable } from '@nestjs/common';
import { Cliente } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateClienteDto): Promise<Cliente> {
    return this.prisma.cliente.create({ data });
  }

  findAll(): Promise<Cliente[]> {
    return this.prisma.cliente.findMany({
      where: { deletadoEm: null },
      orderBy: { clienteId: 'asc' },
    });
  }

  findById(clienteId: string): Promise<Cliente | null> {
    return this.prisma.cliente.findFirst({
      where: { clienteId, deletadoEm: null },
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
