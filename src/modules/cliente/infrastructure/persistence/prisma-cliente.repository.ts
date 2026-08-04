import { Injectable } from '@nestjs/common';
import { Tipo } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Cliente } from '../../domain/entities/cliente.entity';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { clienteInclude, reconstituirCliente } from './mappers/cliente.mapper';

@Injectable()
export class PrismaClienteRepository extends ClienteRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async buscarPorId(clienteId: string): Promise<Cliente | null> {
    const raw = await this.prisma.cliente.findFirst({
      where: { clienteId, deletadoEm: null },
      include: clienteInclude,
    });
    return raw ? reconstituirCliente(raw) : null;
  }

  async listar(): Promise<Cliente[]> {
    const rows = await this.prisma.cliente.findMany({
      where: { deletadoEm: null },
      orderBy: { clienteId: 'asc' },
      include: clienteInclude,
    });
    return rows.map(reconstituirCliente);
  }

  async existeComDocumento(
    numDocumento: string,
    ignorarClienteId?: string,
  ): Promise<boolean> {
    const existente = await this.prisma.cliente.findFirst({
      where: { numDocumento, deletadoEm: null },
      select: { clienteId: true },
    });
    if (!existente) return false;
    if (ignorarClienteId && existente.clienteId === ignorarClienteId) return false;
    return true;
  }

  async salvar(cliente: Cliente): Promise<void> {
    const dados = {
      nome: cliente.nome,
      telefone: cliente.telefone,
      numDocumento: cliente.documento.numero,
      tipo: cliente.tipo.valor as Tipo,
      deletadoEm: cliente.deletadoEm,
    };

    if (cliente.foiCriadoAgora) {
      await this.prisma.cliente.create({
        data: { clienteId: cliente.clienteId, ...dados },
      });
    } else {
      await this.prisma.cliente.update({
        where: { clienteId: cliente.clienteId },
        data: dados,
      });
    }
  }
}
