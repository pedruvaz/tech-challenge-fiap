import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePecaDto } from '../dto/create-peca.dto';
import { UpdatePecaDto } from '../dto/update-peca.dto';

@Injectable()
export class PecasRepository {
    constructor(private prisma: PrismaService) { }

    async create(createPecaDto: CreatePecaDto) {
        return await this.prisma.peca.create({
            data: createPecaDto
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
            data: updatePecaDto
        });
    }

    async remove(id: number) {
        return await this.prisma.peca.delete({ where: { pecaId: Number(id) } });
    }
}
