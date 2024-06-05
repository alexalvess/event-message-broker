export { Bus } from './aws-provider/services/Bus';
import { Configuration } from './aws-provider/utils/Configuration';
import { Infrastructure } from './aws-provider/infrastructure/Infrastructure';
import { ConfigureEndpoint, TagsResourceInput } from "./aws-provider/utils/types";
import opentelemetry from '@opentelemetry/api';

export class MessageBus {
    private static infrastructure = new Infrastructure();

    public static configureTags(tags: TagsResourceInput) {
        Configuration.pushTags(tags);
    }

    public static async configureEndpoints(endpoints: ConfigureEndpoint) {
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