import { AWSBus } from './aws-provider/services/AWSBus';
import { IBus } from './application/iBus';
import { IInfrastructure } from './application/iInfrastructure';
import { Configuration } from './application/utils/configurations';
import { TagsResourceInput } from './application/utils/types';
import { AWSInfrastructure } from './aws-provider/infrastructure/AWSInfrastructure';
import { ConfigureEndpoint } from "./aws-provider/utils/types";
import { RabbitMqInfrastructure } from './rabbitmq-provider/infrastructure/RabbitMqInfrastructure';
import { RabbitMQBus } from './rabbitmq-provider/services/RabbitMQBus';
import { RabbitMqContext } from './rabbitmq-provider/infrastructure/RabbitMqContext';

export class MessageBus {
    private static infrastructure: IInfrastructure;
    private static bus: IBus;

    public static useAws() {
        this.infrastructure = new AWSInfrastructure();
        this.bus = new AWSBus();
        return this;
    }

    public static async useRabbitMq() {
        const channel = await RabbitMqContext.configureContext();

        this.infrastructure = new RabbitMqInfrastructure(channel);
        this.bus = new RabbitMQBus(channel);

        return this;
    }

    public static configureTags(tags: TagsResourceInput) {
        Configuration.pushTags(tags);
        return this;
    }

    public static configurePrefetch(prefetch: number) {
        Configuration.configurePrefetch(prefetch);
        return this;
    }

    public static get Bus() {
        return this.bus;
    }

    public static async configureEndpoints(endpoints: ConfigureEndpoint) {
        if(!this.infrastructure || !this.bus) {
            throw new Error('Need to define what provider will be use');
        }

        await Promise.all(
            endpoints.map(async endpoint => {
                await this.infrastructure.createQueue(endpoint.Queue);
                await this.infrastructure.bindTopic({
                    QueueName: endpoint.Queue,
                    TopicName: endpoint.Topic
                });
            })
        );
    }
}