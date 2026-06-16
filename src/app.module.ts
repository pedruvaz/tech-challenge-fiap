import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsuarioModule } from './domains/usuario/usuario.router';
import { VeiculoModule } from './domains/veiculo/veiculo.router';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsuarioModule,
    VeiculoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
