import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PecasModule } from './modules/pecas/pecas.module';
import { PecasUtilizadasModule } from './modules/pecas-utilizadas/pecas-utilizadas.module';
import { InsumosModule } from './modules/insumos/insumos.module';
import { InsumosConsumidosModule } from './modules/insumos-consumidos/insumos-consumidos.module';
import { ServicoModule } from './modules/servico/servico.module';
import { ServicosRealizadosModule } from './modules/servicos-realizados/servicos-realizados.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, PecasModule, InsumosModule, InsumosConsumidosModule, PecasUtilizadasModule, ServicoModule, ServicosRealizadosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
