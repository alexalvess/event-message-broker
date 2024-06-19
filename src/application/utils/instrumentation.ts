import { trace } from '@opentelemetry/api';
import { NodeTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { Resource } from '@opentelemetry/resources'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const provider = new NodeTracerProvider({
  resource: new Resource({
    'service.name': 'message-bus',
  }),
});

const traceExporter = new JaegerExporter({ 
  endpoint: process.env.OPENTELEMETRY_ENDPOINT
});

provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
provider.register();

export function getTracer() {
  return trace.getTracer('message-bus');
}