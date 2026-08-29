import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK, tracing } from '@opentelemetry/sdk-node';

// OpenTelemetry precisa ser inicializado ANTES de qualquer import de http,
// express ou pg — a auto-instrumentação funciona fazendo patch desses módulos
// no require. Por isso este arquivo é o primeiro import do main.ts, e por
// isso ele lê process.env direto: o ConfigModule do Nest ainda não existe
// neste ponto (em produção as envs vêm do ConfigMap; localmente o padrão é
// ficar desligado mesmo).
//
// O que a auto-instrumentação cobre aqui: requests HTTP de entrada (express),
// a árvore de handlers do Nest e as queries SQL — o Prisma 7 fala com o
// Postgres pelo driver `pg` (@prisma/adapter-pg), que é instrumentado.
//
// Exporter escolhido por env, do mais específico pro mais simples:
//   OTEL_EXPORTER_OTLP_ENDPOINT definido -> OTLP (collector/Jaeger/vendor)
//   OTEL_TRACES_EXPORTER=console        -> spans no stdout (kubectl logs)
//   nada definido                       -> SDK nem sobe; custo zero
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const consoleExporter = process.env.OTEL_TRACES_EXPORTER === 'console';
const enabled =
  process.env.OTEL_SDK_DISABLED !== 'true' &&
  (Boolean(otlpEndpoint) || consoleExporter);

export const otelSdk: NodeSDK | null = enabled
  ? new NodeSDK({
      serviceName: process.env.OTEL_SERVICE_NAME ?? 'tech-challenge-fiap-api',
      traceExporter: otlpEndpoint
        ? new OTLPTraceExporter()
        : new tracing.ConsoleSpanExporter(),
      instrumentations: [
        getNodeAutoInstrumentations({
          // fs gera dezenas de spans por request sem valor de diagnóstico
          '@opentelemetry/instrumentation-fs': { enabled: false },
        }),
      ],
    })
  : null;

otelSdk?.start();

// O enableShutdownHooks() do Nest cuida da aplicação; o SDK tem ciclo de
// vida próprio e precisa do flush explícito, senão o rolling update do K8s
// descarta os últimos spans do pod que está morrendo.
for (const sinal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(sinal, () => {
    void otelSdk?.shutdown().catch(() => undefined);
  });
}
