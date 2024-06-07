import { Channel } from 'amqplib';
import { IInfrastructure } from '../../application/iInfrastructure';
import { BindTopicInput } from '../../application/utils/types';
import { RabbitMqContext } from './RabbitMqContext';

export class RabbitMqInfrastructure implements IInfrastructure {
    private channel: Channel;

    constructor(channel: Channel) {
        this.channel = channel;
    }

    public async createQueue(queueName: string): Promise<void> {
        await this.channel.assertQueue(queueName, { durable: true });
    }

    public async bindTopic(binder: BindTopicInput): Promise<void> {
        await this.channel.assertExchange(
            binder.TopicName, 
            'direct', 
            binder.DelayedQueue 
                ? 
                    { 
                        durable: true, 
                        arguments: { 
                            'x-delayed-type': 'direct' 
                        } 
                    }
                : 
                    { 
                        durable: true 
                    }
        );

        await this.channel.bindQueue(binder.QueueName, binder.TopicName, 'msg');
    }
}