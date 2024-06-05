import { startSpan } from "../utils/o11y";
import { ConsumerParams, GenericMessage, RedeliveryInput, ScheduleInput } from "../utils/types";
import { EventBridgeService } from "./EventBridgeService"
import { SNSService } from "./SNSService";
import { SQSService } from "./SQSService";
import { Span, SpanKind, SpanStatusCode } from '@opentelemetry/api';

export class Bus {
    private static readonly eventBridge = new EventBridgeService();
    private static readonly sqs = new SQSService();
    private static readonly sns = new SNSService();

    public static async publish<TMessage extends GenericMessage>(topicName: string, message: TMessage) {
        await this.handleSpan(async (span) => {
            span.setAttribute('topic', topicName);
            
            const messageId = await this.sns.publish(topicName, message);
            
            span.addEvent('message-published', { 
                provider: 'aws-sns', 
                messageId,
                correlationId: message.CorrelationId
            });
        });
    }

    public static async send<TMessage extends GenericMessage>(queueName: string, message: TMessage, params?: {}){
        await this.handleSpan(async (span) => {
            span.setAttribute('queue', queueName);

            const messageId = await this.sqs.send(queueName, message, params);
            
            span.addEvent('message-sent', { 
                provider: 'aws-sqs', 
                messageId, 
                correlationId: message.CorrelationId })
        });
    }

    public static async redelivery<TMessage extends GenericMessage>(params: RedeliveryInput<TMessage>) {
        await this.handleSpan(async (span) => {
            span.setAttribute('queue', params.QueueName);

            const output = await this.sqs.redelivery(params);
            
            span.addEvent('message-redelivered', {
                provider: 'aws-sqs',
                messageId: output.messageId,
                correlationId: params.Message.Content.CorrelationId,
                delay: params.DelaySeconds + 's',
                attempt: output.attempt,
                startsAt: output.startsAt
            });
        });
    }

    public static async schedule<TMessage extends GenericMessage>(params: ScheduleInput<TMessage>) {
        await this.handleSpan(async (span) => {
            span.setAttribute('topic', params.TopicName);
            
            const output = await this.eventBridge.schedule(params);

            span.addEvent('message-scheduled', {
                correlationId: params.Message.CorrelationId,
                scheduleName: output.Id,
                scheduleArn: output.ScheduleArn
            });
        });
    }

    public static consume<TMessage extends GenericMessage>(params: ConsumerParams<TMessage>){
        return this.sqs.consume(params);
    }

    private static async handleSpan(func: (span: Span) => Promise<void>) {
        const span = startSpan('bus', SpanKind.PRODUCER);
        try {
            await func(span);
        } catch (error: any) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
            span.recordException(error);

            throw error;
        } finally {
            span.end();
        }

    }
}