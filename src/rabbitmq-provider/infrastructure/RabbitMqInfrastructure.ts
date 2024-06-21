import { Channel } from 'amqplib';
import { IInfrastructure } from '../../application/iInfrastructure';
import { BindTopicInput } from '../../application/utils/types';
import { v4 as uuidV4 } from 'uuid';

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
            { 
                durable: true, 
                arguments: { 
                    'x-delayed-type': 'direct' 
                } 
            }
        );

        await this.channel.bindQueue(binder.QueueName, binder.TopicName, '*');
    }

    public async bindTemporaryTopic(queueName: string): Promise<string> {
        const topicName = `${uuidV4}-temporary-exchange`;

        await this.channel.assertExchange(
            topicName, 
            'direct', 
            { 
                durable: true, 
                arguments: { 
                    'x-delayed-type': 'direct' 
                }
            }
        );

        await this.channel.bindQueue(queueName, topicName, '*');

        return topicName;
    }

    public async deleteTopic(queueName: string, topicName: string): Promise<void> {
        this.channel.unbindQueue(queueName, topicName, '*');
        await this.channel.deleteExchange(topicName);
    }
}