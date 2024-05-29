import { 
    SQSClient, 
    SendMessageCommand 
} from "@aws-sdk/client-sqs";

import { 
    ConsumerParams, 
    MessageContext, 
    RedeliveryInput, 
    SecondLevelResilienceInput 
} from "../utils/types";

import { QUEUE_URL_TEMPLATE } from "../utils/constants";
import { Consumer } from "sqs-consumer";

export class SQSService {
    private readonly client: SQSClient;

    constructor() {
        this.client = new SQSClient();
    }

    public async send<TMessage extends keyof Object>(
        queueName: string, 
        message: TMessage,
        params?: {}
    ) {
        const command = new SendMessageCommand({
            MessageBody: JSON.stringify(message),
            QueueUrl: QUEUE_URL_TEMPLATE.replace('[queueName]', queueName),
            ...params
        });

        const output = await this.client.send(command);

        return output.MessageId;
    }

    public async redelivery<TMessage extends keyof Object>(params: RedeliveryInput<TMessage>) {
        const command = new SendMessageCommand({
            QueueUrl: QUEUE_URL_TEMPLATE.replace('[queueName]', params.QueueName),
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

        return output.MessageId;
    }

    public async consume<TMessage extends keyof Object>(params: ConsumerParams<TMessage>) {
        const consumer = Consumer.create({
            messageAttributeNames: ['All'],
            queueUrl: QUEUE_URL_TEMPLATE.replace('[queueName]', params.Endpoint),
            batchSize: params.BatchSize,
            sqs: this.client,
            handleMessage: async (message: MessageContext<TMessage>) => {
                try {
                    this.bindMessage(message);
                    await params.handle(message);
                } catch (error: any) {
                    await this.secondLevelResilience({
                        DelaySeconds: params.DelaySeconds,
                        MaxRetryCount: params.MaxRetryCount,
                        Message: message,
                        QueueName: params.Endpoint
                    });
                }
            }
        });

        consumer.start();
    }

    private bindMessage<TMessage extends keyof Object>(message: MessageContext<TMessage>) {
        if (message.Body) {
            let messageContent = JSON.parse(message.Body);

            if (messageContent.Type === 'Notification') {
                messageContent = JSON.parse(messageContent.Message);
            }

            message.Content = messageContent;
        }
    }

    private async secondLevelResilience<TMessage extends keyof Object>(params: SecondLevelResilienceInput<TMessage>) {
        let retryCount: number = parseInt(params.Message?.MessageAttributes?.['RetryCount']?.StringValue ?? '0');

        await this.send(
            retryCount <= params.MaxRetryCount ? params.QueueName : `${params.QueueName}-dlq`,
            params.Message.Content,
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