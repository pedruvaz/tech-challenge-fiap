import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import helmet from 'helmet';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { EmailService } from '../../src/libs/email/email.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { DomainExceptionFilter } from '../../src/shared/infrastructure/http/domain-exception.filter';

export interface OrcamentoEnviado {
  emailCliente: string;
  nomeCliente: string;
  osId: string;
  valorFinal: number;
  linkAprovar: string;
  linkRejeitar: string;
}

/**
 * Dublê do `EmailService`.
 *
 * O serviço real instancia o SDK da Resend com `process.env.RESEND_API_KEY`;
 * sem a chave o construtor lança, e a CI não tem (nem deve ter) uma chave
 * real. Além disso, e2e não manda e-mail de verdade — o que interessa testar
 * é o que a aplicação *pediu* para enviar, e é isso que `enviados` guarda.
 */
export class EmailServiceFake {
  readonly enviados: OrcamentoEnviado[] = [];

  enviarOrcamento(params: OrcamentoEnviado): Promise<void> {
    this.enviados.push(params);
    return Promise.resolve();
  }

  limpar(): void {
    this.enviados.length = 0;
  }

  get ultimo(): OrcamentoEnviado | undefined {
    return this.enviados[this.enviados.length - 1];
  }
}

export interface ContextoDeTeste {
  app: INestApplication<App>;
  prisma: PrismaService;
  email: EmailServiceFake;
}

/**
 * Sobe a aplicação espelhando o `bootstrap()` do `main.ts` — mesmos pipe,
 * filtro, helmet e CORS. Se a e2e montasse o app de outro jeito, estaria
 * testando uma aplicação que não é a que roda em produção.
 */
export async function criarAppDeTeste(): Promise<ContextoDeTeste> {
  const email = new EmailServiceFake();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useValue(email)
    .compile();

  const app: INestApplication<App> = moduleFixture.createNestApplication();

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: { upgradeInsecureRequests: null },
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
  app.useGlobalFilters(new DomainExceptionFilter());
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.init();

  return { app, prisma: moduleFixture.get(PrismaService), email };
}
