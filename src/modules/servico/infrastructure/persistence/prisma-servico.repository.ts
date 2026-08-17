import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Servico } from '../../domain/entities/servico.entity';
import { ServicoRepository } from '../../domain/repositories/servico.repository';
import { reconstituirServico } from './mappers/servico.mapper';

@Injectable()
export class PrismaServicoRepository extends ServicoRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async buscarPorId(servicoId: number): Promise<Servico | null> {
    const raw = await this.prisma.servico.findFirst({
      where: { servicoId, deletadoEm: null },
    });
    return raw ? reconstituirServico(raw) : null;
  }

  async listar(): Promise<Servico[]> {
    const rows = await this.prisma.servico.findMany({
      where: { deletadoEm: null },
      orderBy: { servicoId: 'asc' },
    });
    return rows.map(reconstituirServico);
  }

  async salvar(servico: Servico): Promise<Servico> {
    const dados = {
      descricao: servico.descricao,
      valor: servico.valor,
      deletadoEm: servico.deletadoEm,
    };

    if (servico.foiCriadoAgora) {
      const criado = await this.prisma.servico.create({ data: dados });
      return reconstituirServico(criado);
    }

    if (servico.servicoId === null) {
      throw new Error(
        'Servico reconstituído sem servicoId — invariante violada',
      );
    }

    const atualizado = await this.prisma.servico.update({
      where: { servicoId: servico.servicoId },
      data: dados,
    });
    return reconstituirServico(atualizado);
  }
}
