// Primeiro import de propósito: a instrumentação do OpenTelemetry faz patch
// de http/express/pg no require, então precisa carregar antes de tudo.
import './tracing';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // O default do helmet inclui upgrade-insecure-requests, que faz o
          // browser reescrever todos os assets para https. Atrás do NLB
          // http-only do EKS isso quebra o Swagger (ERR_SSL_PROTOCOL_ERROR).
          // Em localhost nunca aparece: localhost é origem "trustworthy".
          upgradeInsecureRequests: null,
        },
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Tech Challenge — Oficina Mecânica')
    .setDescription(
      'API de gestão de ordens de serviço, clientes e peças (DDD).',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Informe apenas o token, sem o prefixo "Bearer "',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  document.security = [{ 'access-token': [] }];
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
