import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateServicoDto } from '../dto/update-servico.dto';
import { CreateServicoDto } from '../dto/create-servico.dto';

@Injectable()
export class ServicoRepository {
    constructor(private prisma: PrismaService) { }

    async create(createServicoDto: CreateServicoDto) {
        return await this.prisma.servico.create({
            data: createServicoDto
        });
    }

    async findAll() {
        return await this.prisma.servico.findMany();
    }

    async findOne(id: number) {
        const servico = await this.prisma.servico.findUnique({ where: { servicoId: Number(id) } })
        if (!servico) {
            throw new NotFoundException('Serviço não encontrado.');
        }
        return servico;
    }

    async update(id: number, updateServicoDto: UpdateServicoDto) {
        return await this.prisma.servico.update({
            where: { servicoId: id },
            data: updateServicoDto,
        });
    }

    async remove(id: number) {
        return await this.prisma.servico.delete({ where: { servicoId: id } });
    }
}
