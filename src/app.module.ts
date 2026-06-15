import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PecasModule } from './modules/pecas/pecas.module';
import { InsumosConsumidosModule } from './modules/insumos-consumidos/insumos-consumidos.module';
import { PecasUtilizadasModule } from './modules/pecas-utilizadas/pecas-utilizadas.module';
import { Insumos } from './modules/insumos/repositories/insumos.repository';
import { InsumosConsumidos } from './modules/insumos-consumidos/repositories/insumos-consumidos.repository';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, PecasModule, InsumosConsumidosModule, PecasUtilizadasModule],
  controllers: [AppController],
  providers: [AppService, Insumos, InsumosConsumidos],
})
export class AppModule {}
