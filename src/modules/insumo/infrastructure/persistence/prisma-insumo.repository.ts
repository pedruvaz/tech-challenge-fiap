import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Insumo } from '../../domain/entities/insumo.entity';
import { InsumoRepository } from '../../domain/repositories/insumo.repository';
import { reconstituirInsumo } from './mappers/insumo.mapper';

@Injectable()
export class PrismaInsumoRepository extends InsumoRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async buscarPorId(insumoId: number): Promise<Insumo | null> {
    const raw = await this.prisma.insumo.findFirst({
      where: { insumoId, deletadoEm: null },
    });
    return raw ? reconstituirInsumo(raw) : null;
  }

  async listar(): Promise<Insumo[]> {
    const rows = await this.prisma.insumo.findMany({
      where: { deletadoEm: null },
      orderBy: { insumoId: 'asc' },
    });
    return rows.map(reconstituirInsumo);
  }

  async salvar(insumo: Insumo): Promise<Insumo> {
    const dados = {
      nome: insumo.nome,
      qtdEstoque: insumo.qtdEstoque,
      valorUn: insumo.valorUn,
      deletadoEm: insumo.deletadoEm,
    };

    if (insumo.foiCriadoAgora) {
      const criado = await this.prisma.insumo.create({ data: dados });
      return reconstituirInsumo(criado);
    }

    if (insumo.insumoId === null) {
      throw new Error('Insumo reconstituído sem insumoId — invariante violada');
    }

    const atualizado = await this.prisma.insumo.update({
      where: { insumoId: insumo.insumoId },
      data: dados,
    });
    return reconstituirInsumo(atualizado);
  }
}
