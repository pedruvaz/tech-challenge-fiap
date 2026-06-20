import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PecasModule } from './domains/pecas/pecas.module';
import { InsumosModule } from './domains/insumos/insumos.module';
import { ServicoModule } from './domains/servico/servico.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    PecasModule,
    InsumosModule,
    ServicoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
