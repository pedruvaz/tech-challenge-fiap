import { Module } from '@nestjs/common';
import { PecasUtilizadasService } from './pecas-utilizadas.service';
import { PecasUtilizadasController } from './pecas-utilizadas.controller';
import { PecasUtilizadasRepository } from './repositories/pecas-utilizadas.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PecasUtilizadasController],
  providers: [PecasUtilizadasService, PecasUtilizadasRepository, PrismaService],
})
export class PecasUtilizadasModule {}
