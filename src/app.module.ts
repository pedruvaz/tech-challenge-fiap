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
import { AprovacaoModule } from './modules/aprovacao/aprovacao.module';
import { OrdemServicoModule } from './modules/ordem-servico/infrastructure/ordem-servico.module';
import { JwtAuthMiddleware } from './middleware/jwt-auth.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { UsuarioModule } from './modules/usuario/infrastructure/usuario.module';
import { VeiculoModule } from './modules/veiculo/infrastructure/veiculo.module';
import { ClienteModule } from './modules/cliente/infrastructure/cliente.module';
import { PecaModule } from './modules/peca/infrastructure/peca.module';
import { InsumoModule } from './modules/insumo/infrastructure/insumo.module';
import { ServicoModule } from './modules/servico/infrastructure/servico.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({}),
    PrismaModule,
    AuthModule,
    UsuarioModule,
    VeiculoModule,
    ClienteModule,
    PecaModule,
    InsumoModule,
    ServicoModule,
    OrdemServicoModule,
    AprovacaoModule,
    HealthModule,
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
        { path: 'health/liveness', method: RequestMethod.GET },
        { path: 'health/readiness', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
