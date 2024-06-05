import { IBus } from "../../application/iBus";
import { startSpan } from "../../application/utils/o11y";
import { ConsumerParams, GenericMessage, RedeliveryInput, ScheduleInput } from "../../application/utils/types";
import { AWSMessageContext } from '../utils/types';
import { EventBridgeService } from "./EventBridgeService"
import { SNSService } from "./SNSService";
import { SQSService } from "./SQSService";
import { Span, SpanKind, SpanStatusCode } from '@opentelemetry/api';

export class Bus implements IBus {
    private readonly eventBridge = new EventBridgeService();
    private readonly sqs = new SQSService();
    private readonly sns = new SNSService();

    public async publish<TMessage extends GenericMessage>(
        topicName: string, 
        message: TMessage
    ) : Promise<void> {
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

    public async send<TMessage extends GenericMessage>(
        queueName: string, 
        message: TMessage, 
        params?: {}
    ) : Promise<void> {
        await this.handleSpan(async (span) => {
            span.setAttribute('queue', queueName);

            const messageId = await this.sqs.send(queueName, message, params);
            
            span.addEvent('message-sent', { 
                provider: 'aws-sqs', 
                messageId, 
                correlationId: message.CorrelationId })
        });
    }

    public async redelivery<TMessage extends GenericMessage>(
        params: RedeliveryInput<AWSMessageContext<TMessage>, TMessage>
    ) : Promise<void> {
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

    public async schedule<TMessage extends GenericMessage>(
        params: ScheduleInput<TMessage>
    ) : Promise<void> {
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

    public consume<TMessage extends GenericMessage>(
        params: ConsumerParams<TMessage>
    ) : void {
        this.sqs.consume(params);
    }

    private async handleSpan(func: (span: Span) => Promise<void>) {
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