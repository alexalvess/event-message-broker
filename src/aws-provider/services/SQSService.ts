import { 
    Message,
    SQSClient, 
    SendMessageCommand 
} from "@aws-sdk/client-sqs";

import { AWSMessageContext } from "../utils/types";

import { QUEUE_URL_TEMPLATE } from "../utils/constants";
import { Consumer } from "sqs-consumer";
import { startSpan } from "../../application/utils/o11y";
import { SpanKind } from '@opentelemetry/api';
import { ConsumerParams, GenericMessage, RedeliveryInput, SecondLevelResilienceInput } from "../../application/utils/types";
import { Configuration } from "../../application/utils/configuration";

export class SQSService {
    private readonly client: SQSClient;

    constructor() {
        this.client = new SQSClient();
    }

    public async send<TMessage extends GenericMessage>(
        queueName: string, 
        message: TMessage,
        params?: {}
    ) {
        const command = new SendMessageCommand({
            MessageBody: JSON.stringify(message),
            QueueUrl: QUEUE_URL_TEMPLATE(queueName),
            ...params
        });

        const output = await this.client.send(command);

        return output.MessageId;
    }

    public async redelivery<TMessage extends GenericMessage>(
        params: RedeliveryInput<AWSMessageContext<TMessage>, TMessage>
    ) {
        const command = new SendMessageCommand({
            QueueUrl: QUEUE_URL_TEMPLATE(params.QueueName),
            MessageBody: params.Message.Body,
            DelaySeconds: params.DelaySeconds,
            MessageAttributes: {
                RedeliveryStartsAt: {
                    DataType: 'String',
                    StringValue: (new Date(params.Message?.MessageAttributes?.['RedeliveryStartsAt']?.StringValue ?? new Date())).toString()
                },
                RedeliveryCurrentAt: {
                    DataType: 'String',
                    StringValue: new Date().toString()
                },
                RedeliveryAttempt: {
                    DataType: 'Number',
                    StringValue: (parseInt(params.Message?.MessageAttributes?.['RedeliveryAttempt']?.StringValue ?? '0') + 1).toString()
                }
            },
            ...params.Params
        });

        const output = await this.client.send(command);

        return {
            messageId: output.MessageId,
            startsAt: command.input.MessageAttributes?.['RedeliveryStartsAt'].StringValue,
            attempt: command.input.MessageAttributes?.['RedeliveryAttempt'].StringValue
        };
    }

    public consume<TMessage extends GenericMessage>(params: ConsumerParams<TMessage>) {
        const consumer = Consumer.create({
            messageAttributeNames: ['All'],
            queueUrl: QUEUE_URL_TEMPLATE(params.Endpoint),
            batchSize: Configuration.prefetch,
            sqs: this.client,
            handleMessage: async (message: AWSMessageContext<TMessage>) => {
                const span = startSpan('bus', SpanKind.CONSUMER);

                try {
                    span.setAttribute('queue', params.Endpoint);

                    this.bindMessage(message);
                    await params.handle(message);

                    span.addEvent('message-consumed', {
                        correlationId: message.Object.CorrelationId
                    });
                } catch (error: any) {
                    await this.secondLevelResilience({
                        DelaySeconds: params.DelaySeconds,
                        MaxRetryCount: params.MaxRetryCount,
                        Message: message,
                        QueueName: params.Endpoint
                    });
                } finally {
                    span.end();
                }
            }
        });

        consumer.start();
    }

    private bindMessage<TMessage extends GenericMessage>(message: AWSMessageContext<TMessage>) {
        if (message.Body) {
            let messageContent = JSON.parse(message.Body);

            if (messageContent.Type === 'Notification') {
                messageContent = JSON.parse(messageContent.Message);
            }

            message.Object = messageContent;
        }
    }

    private async secondLevelResilience<TMessage extends GenericMessage>(
        params: SecondLevelResilienceInput<AWSMessageContext<TMessage>, TMessage>,
    ) {
        let retryCount: number = parseInt(params.Message?.MessageAttributes?.['RetryCount']?.StringValue ?? '0');

        await this.send(
            retryCount <= params.MaxRetryCount ? params.QueueName : `${params.QueueName}-dlq`,
            params.Message.Object,
            {
                DelaySeconds: retryCount <= params.MaxRetryCount ? params.DelaySeconds : 0,
                MessageAttributes: {
                    'RetryCount': {
                        DataType: 'Number',
                        StringValue: (retryCount <= params.MaxRetryCount ? (retryCount + 1) : params.MaxRetryCount).toString()
                    }
                }
            }
        );
    }
}