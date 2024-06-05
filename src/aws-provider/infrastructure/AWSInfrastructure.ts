import { IInfrastructure } from "../../application/iInfrastructure";
import { startSpan } from "../../application/utils/o11y";
import { BindTopicInput } from "../../application/utils/types";
import { SNSInfrastructure } from "./SNSInfrastructure";
import { SQSInfrastructure } from "./SQSInfrastructure";
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';

export class AWSInfrastructure implements IInfrastructure {
    private readonly sns: SNSInfrastructure;
    private readonly sqs: SQSInfrastructure;

    constructor() {
        this.sns = new SNSInfrastructure();
        this.sqs = new SQSInfrastructure();
    }

    public async use() {
        return this;
    }

    public async createQueue(queueName: string) {
        const span = startSpan(this.createQueue.name, SpanKind.SERVER);

        try {
            await this.sqs.create(queueName, span);
        } catch (error: any) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
            span.recordException(error);

            throw error;
        } finally {
            span.end();
        }        
    }

    public async bindTopic(binder: BindTopicInput) {
        const span = startSpan(this.createQueue.name, SpanKind.SERVER);

        try {
            const topicOutput = await this.sns.create(binder.TopicName, span);

            if(topicOutput.Created) {
                const policy = await this.sqs.linkTopicQueuePolicy(binder.QueueName, binder.TopicName);
                span.addEvent('queue-policy-linked', { policy: JSON.stringify(policy) })

                const arn = await this.sns.subscribeEndpoints(binder.TopicName, binder.QueueName);
                span.addEvent('endpoint-subscribed', { arn });
            }
        } catch (error: any) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
            span.recordException(error);

            throw error;
        } finally {
            span.end();
        }
        
    }
}