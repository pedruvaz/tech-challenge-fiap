import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PecasModule } from './pecas/pecas.module';
import { InsumosConsumidosModule } from './insumos-consumidos/insumos-consumidos.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, PecasModule, InsumosConsumidosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
