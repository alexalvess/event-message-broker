import { Channel } from 'amqplib';
import { IInfrastructure } from '../../application/iInfrastructure';
import { BindTopicInput } from '../../application/utils/types';
import { RabbitMqContext } from './RabbitMqContext';

export class RabbitMqInfrastructure implements IInfrastructure {
    private channel: Channel;

    public async use() {
        this.channel = await RabbitMqContext.configureContext();
        return this;
    }

    public async createQueue(queueName: string): Promise<void> {
        await this.channel.assertQueue(queueName, { durable: false });
    }

    public async bindTopic(binder: BindTopicInput): Promise<void> {
        await this.channel.assertExchange(binder.TopicName, 'direct', { durable: false });
        await this.channel.bindQueue(binder.QueueName, binder.TopicName, 'msg');
    }
}