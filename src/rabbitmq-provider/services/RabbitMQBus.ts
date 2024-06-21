import { Channel, ConfirmChannel, ConsumeMessage } from "amqplib";
import { IBus } from "../../application/iBus";
import { GenericMessage, MessageContext, RedeliveryInput, ScheduleInput, ConsumerParams, SecondLevelResilienceInput } from "../../application/utils/types";
import { RabbitMqInfrastructure } from "../infrastructure/RabbitMqInfrastructure";
import { RabbitMqMessageContext } from "../utils/types";

export class RabbitMQBus implements IBus {
    private readonly channel: Channel;

    constructor(channel: Channel) {
        this.channel = channel;
    }

    public async publish<TMessage extends GenericMessage>(topicName: string, message: TMessage): Promise<void> {
        await this.publishInExchange(topicName, "*", message, {});
    }

    public async send<TMessage extends GenericMessage>(queueName: string, message: TMessage, _: {}): Promise<void> {
        await this.sendInQueue(queueName, message);
    }

    public async redelivery<TMessageContext extends MessageContext<TMessage>, TMessage extends GenericMessage>(params: RedeliveryInput<TMessageContext, TMessage>): Promise<void> {
        const infra = new RabbitMqInfrastructure(this.channel);
        const temporaryTopic = await infra.bindTemporaryTopic(params.QueueName);

        await this.publishInExchange(
            temporaryTopic, 
            "*", 
            params.Message.Object,
            {
                'x-delay': params.DelaySeconds * 1000
            }
        );
    }

    public async schedule<TMessage extends GenericMessage>(params: ScheduleInput<TMessage>): Promise<void> {
        await this.publishInExchange(
            params.TopicName, 
            "*", 
            params.Message,
            {
                'x-delay': (params.ScheduleDate.getTime() - (new Date()).getTime())
            }
        );
    }

    public async consume<TMessage extends GenericMessage>(params: ConsumerParams<TMessage>): Promise<void> {
        const confirmChannel = await this.channel.connection.createConfirmChannel();

        confirmChannel.consume(
            params.Endpoint,
            async (message: ConsumeMessage | null) => {
                if(!message) {
                    return;
                }

                let messageContext: RabbitMqMessageContext<TMessage> = message as RabbitMqMessageContext<TMessage>;

                messageContext.Object = JSON.parse(message.content.toString('utf-8'));

                try {
                    await params.handle(messageContext);    
                } catch (error: any) {
                    await this.secondLevelResilience({
                        DelaySeconds: params.DelaySeconds,
                        MaxRetryCount: params.MaxRetryCount,
                        QueueName: params.Endpoint,
                        Message: messageContext
                    });
                }
            }
        );
    }

    private async secondLevelResilience<TMessage extends GenericMessage>(
        params: SecondLevelResilienceInput<RabbitMqMessageContext<TMessage>, TMessage>
    ) {
        const redeliveryAttempt = parseInt(params.Message.properties.headers?.['x-redelivery-attempt'] ?? 0) + 1;

        if(redeliveryAttempt > params.MaxRetryCount) {
            await this.sendInQueue(params.QueueName + '-dlq', params.Message.Object);
        } else {
            const infra = new RabbitMqInfrastructure(this.channel);
            const temporaryTopic = await infra.bindTemporaryTopic(params.QueueName);

            await this.publishInExchange(
                temporaryTopic,
                "*",
                params.Message.Object,
                {
                    'x-delay': params.DelaySeconds * 1000,
                    'x-redelivery-attempt': redeliveryAttempt
                }
            )
        }
    }

    private async publishInExchange<TMessage extends GenericMessage>(
        topicName: string, 
        routingKey: string = "*", 
        message: TMessage,
        headers: {}): Promise<void> {
        const confirmChannel = await this.channel.connection.createConfirmChannel();

        return new Promise<void>((resolve, reject) => {
            confirmChannel.publish(
                topicName, 
                routingKey,
                Buffer.from(JSON.stringify(message)),
                {
                    ...headers,
                    correlationId: message.CorrelationId
                },
                (error, _) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
        });   
    }

    private async sendInQueue<TMessage extends GenericMessage>(
        queueName: string, 
        message: TMessage): Promise<void> {
        const confirmChannel = await this.channel.connection.createConfirmChannel();

        return new Promise<void>((resolve, reject) => {
            confirmChannel.sendToQueue(
                queueName, 
                Buffer.from(JSON.stringify(message)),
                {
                    correlationId: message.CorrelationId
                },
                (error, _) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
        });   
    }

}