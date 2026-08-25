import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Peca } from '../../domain/entities/peca.entity';
import { PecaRepository } from '../../domain/repositories/peca.repository';
import { reconstituirPeca } from './mappers/peca.mapper';

@Injectable()
export class PrismaPecaRepository extends PecaRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async buscarPorId(pecaId: number): Promise<Peca | null> {
    const raw = await this.prisma.peca.findFirst({
      where: { pecaId, deletadoEm: null },
    });
    return raw ? reconstituirPeca(raw) : null;
  }

  async listar(): Promise<Peca[]> {
    const rows = await this.prisma.peca.findMany({
      where: { deletadoEm: null },
      orderBy: { pecaId: 'asc' },
    });
    return rows.map(reconstituirPeca);
  }

  async salvar(peca: Peca): Promise<Peca> {
    const dados = {
      nome: peca.nome,
      qtdEstoque: peca.qtdEstoque,
      valorUn: peca.valorUn,
      deletadoEm: peca.deletadoEm,
    };

    if (peca.foiCriadoAgora) {
      const criada = await this.prisma.peca.create({ data: dados });
      return reconstituirPeca(criada);
    }

    if (peca.pecaId === null) {
      throw new Error('Peça reconstituída sem pecaId — invariante violada');
    }

    const atualizada = await this.prisma.peca.update({
      where: { pecaId: peca.pecaId },
      data: dados,
    });
    return reconstituirPeca(atualizada);
  }
}
