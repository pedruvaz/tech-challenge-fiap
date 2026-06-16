import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateServicosRealizadosDto } from '../dto/create-servicos-realizado.dto';
import { UpdateServicosRealizadosDto } from '../dto/update-servicos-realizado.dto';

@Injectable()
export class ServicosRealizadosRepository {
    constructor(private prisma: PrismaService) { }

    async create(createServicosRealizadosDto: CreateServicosRealizadosDto) {
        const servico = await this.prisma.servico.findUnique({
            where: {
                servicoId: createServicosRealizadosDto.servicoId,
            },
        });

        if (!servico) {
            throw new NotFoundException('Serviço não encontrado.');
        }

        return await this.prisma.servicoRealizado.create({
            data: {
                osId: createServicosRealizadosDto.osId,
                servicoId: createServicosRealizadosDto.servicoId,
                quantidade: createServicosRealizadosDto.quantidade ?? 1,
                valor: servico.valor,
            },
        });
    }

    async findAll() {
        return await this.prisma.servicoRealizado.findMany({
            include: {
                servico: true,
                ordemServico: true,
            },
        });;
    }

    async findOne(osId: string, servicoId: number) {
        const servico = await this.prisma.servicoRealizado.findUnique({
            where: {
                osId_servicoId: {
                    osId,
                    servicoId,
                },
            },
            include: {
                servico: true,
                ordemServico: true,
            },
        })

        if (!servico) {
            throw new NotFoundException('Serviço realizado não encontrado.');
        }

        return servico;
    }

    async update(
        osId: string,
        servicoId: number,
        updateServicoDto: UpdateServicosRealizadosDto) {
        return await this.prisma.servicoRealizado.update({
            where: {
                osId_servicoId: {
                    osId,
                    servicoId,
                },
            },
            data: updateServicoDto
        });
    }

    async remove(osId: string, servicoId: number) {
        return this.prisma.servicoRealizado.delete({
            where: {
                osId_servicoId: {
                    osId,
                    servicoId,
                },
            },
        });
    }
}
