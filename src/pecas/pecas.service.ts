import { Injectable } from '@nestjs/common';
import { CreatePecaDto } from './dto/create-peca.dto';
import { UpdatePecaDto } from './dto/update-peca.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PecasService {

  constructor(private prisma: PrismaService) { }

  async create(createPecaDto: CreatePecaDto) {
    return await this.prisma.peca.create({
      data: {
        nome: createPecaDto.nome,
        qtdEstoque: createPecaDto.qtdEstoque,
        valorUn: createPecaDto.valorUn
      }
    });
  }

  async findAll() {
    return await this.prisma.peca.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.peca.findUnique({ where: { pecaId: Number(id) } });
  }

  async update(id: number, updatePecaDto: UpdatePecaDto) {
    return await this.prisma.peca.update({
      where: { pecaId: Number(id) },
      data: {
        nome: updatePecaDto.nome,
        qtdEstoque: updatePecaDto.qtdEstoque,
        valorUn: updatePecaDto.valorUn,
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.peca.delete({ where: { pecaId: Number(id) } });
  }
}
