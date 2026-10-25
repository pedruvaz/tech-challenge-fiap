import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { trace } from '@opentelemetry/api';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/types/jwt-payload.interface';

function otelTraceMixin(): Record<string, unknown> {
  const span = trace.getActiveSpan();
  if (!span) return {};
  const ctx = span.spanContext();
  return { 'trace.id': ctx.traceId, 'span.id': ctx.spanId };
}

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        ...(process.env.NODE_ENV !== 'production' && {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, singleLine: true },
          },
        }),
        base: {
          service: process.env.OTEL_SERVICE_NAME ?? 'tech-challenge-fiap-api',
          env: process.env.APP_ENV ?? 'development',
          ...(process.env.OTEL_SERVICE_VERSION && {
            version: process.env.OTEL_SERVICE_VERSION,
          }),
        },
        mixin: otelTraceMixin,
        customProps(req: Request) {
          const user = (req as Request & { user?: JwtPayload }).user;
          return user ? { userId: user.sub } : {};
        },
        redact: ['req.headers.authorization'],
        serializers: {
          req(req: { id: string; method: string; url: string }) {
            return { id: req.id, method: req.method, url: req.url };
          },
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
