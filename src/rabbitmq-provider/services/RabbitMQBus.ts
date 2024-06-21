import { Channel, ConfirmChannel } from "amqplib";
import { IBus } from "../../application/iBus";
import { GenericMessage, MessageContext, RedeliveryInput, ScheduleInput, ConsumerParams } from "../../application/utils/types";
import { RabbitMqInfrastructure } from "../infrastructure/RabbitMqInfrastructure";

export class RabbitMQBus implements IBus {
    private readonly channel: Channel;

    constructor(channel: Channel) {
        this.channel = channel;
    }

    public async publish<TMessage extends GenericMessage>(topicName: string, message: TMessage): Promise<void> {
        const confirmChannel = await this.channel.connection.createConfirmChannel();

        return new Promise((resolve, reject) => {
            try {
                confirmChannel.publish(
                    topicName,
                    'msg',
                    Buffer.from(JSON.stringify(message)), undefined, (error, _) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
            } catch (error: any) {
                reject(error);
            }
        });
    }

    public async send<TMessage extends GenericMessage>(queueName: string, message: TMessage, _: {}): Promise<void> {
        const confirmChannel = await this.channel.connection.createConfirmChannel();

        return new Promise((resolve, reject) => {
            confirmChannel.sendToQueue(
                queueName,
                Buffer.from(JSON.stringify(message)),
                undefined,
                (error, _) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                }
            )
        });
    }

    public async redelivery<TMessageContext extends MessageContext<TMessage>, TMessage extends GenericMessage>(params: RedeliveryInput<TMessageContext, TMessage>): Promise<void> {
        const confirmChannel = await this.channel.connection.createConfirmChannel();

        const infra = new RabbitMqInfrastructure(this.channel);
        const temporaryTopic = await infra.bindTemporaryTopic(params.QueueName);

        await new Promise<void>((resolve, reject) => {
            confirmChannel.publish(
                temporaryTopic,
                'msg',
                Buffer.from(JSON.stringify(params.Message)), 
                {
                    headers: {
                        'x-delay': params.DelaySeconds * 1000
                    }
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

    public async schedule<TMessage extends GenericMessage>(params: ScheduleInput<TMessage>): Promise<void> {
        const confirmChannel = await this.channel.connection.createConfirmChannel();

        return new Promise((resolve, reject) => {
            try {
                confirmChannel.publish(
                    params.TopicName,
                    'msg',
                    Buffer.from(JSON.stringify(params.Message)), 
                    {
                        headers: {
                            'x-delay': (params.ScheduleDate.getTime() - (new Date()).getTime())
                        }
                    }, 
                    (error, _) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
            } catch (error: any) {
                reject(error);
            }
        });
    }

    public consume<TMessage extends GenericMessage>(params: ConsumerParams<TMessage>): void {
        console.log(params);
    }

}