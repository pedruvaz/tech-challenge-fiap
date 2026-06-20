import { Module } from '@nestjs/common';
import { PecasService } from './pecas.service';
import { PecasController } from './pecas.controller';
import { PecasRepository } from './repositories/pecas.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PecasController],
  providers: [PecasService, PecasRepository, PrismaService],
})
export class PecasModule {}
