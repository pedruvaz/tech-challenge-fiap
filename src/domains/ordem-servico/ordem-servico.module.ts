import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrdemServicoPublicoController } from './ordem-servico-publico.controller';
import { OrdemServicoController } from './ordem-servico.controller';
import { OrdemServicoRepository } from './ordem-servico.repository';
import { OrdemServicoService } from './ordem-servico.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrdemServicoController, OrdemServicoPublicoController],
  providers: [OrdemServicoService, OrdemServicoRepository],
})
export class OrdemServicoModule {}
