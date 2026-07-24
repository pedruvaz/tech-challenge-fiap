import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AprovacaoModule } from './domains/aprovar-os/aprovar-os.module';
import { OrdemServicoModule } from './domains/ordem-servico/ordem-servico.module';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { UsuarioModule } from './domains/usuario/usuario.router';
import { VeiculoModule } from './domains/veiculo/veiculo.router';
import { ClienteModule } from './domains/cliente/cliente.router';
import { PecasModule } from './domains/pecas/pecas.module';
import { InsumosModule } from './domains/insumos/insumos.module';
import { ServicoModule } from './domains/servico/servico.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({}),
    PrismaModule,
    AuthModule,
    UsuarioModule,
    VeiculoModule,
    ClienteModule,
    PecasModule,
    InsumosModule,
    ServicoModule,
    OrdemServicoModule,
    AprovacaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthMiddleware)
      .exclude(
        { path: '/', method: RequestMethod.GET },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
        { path: 'publico/ordens-servico/:id', method: RequestMethod.GET },
        { path: 'aprovacao/confirmar', method: RequestMethod.GET },
        { path: 'aprovacao/processar', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
