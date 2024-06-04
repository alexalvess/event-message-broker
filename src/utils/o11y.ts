import opentelemetry, { Tracer } from '@opentelemetry/api';
import { SpanKind, Span } from '@opentelemetry/api';

export let tracer: Tracer = opentelemetry.trace.getTracer('messageBus');
export function configure(tracerApi: Tracer) {
    opentelemetry.diag
    tracer = tracerApi;
}

export function startSpan(name: string, kind: SpanKind): Span {
    return tracer.startSpan(
        name,
        {
            kind,
            attributes: {
                aws_region: process.env.AWS_REGION,
                aws_account: process.env.AWS_ACCOUNT
            }
        });
}