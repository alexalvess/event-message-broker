export { Bus } from './services/Bus';
import { Configuration } from './infrastructure/Configuration';
import { Infrastructure } from './infrastructure/Infrastructure';
import { ConfigureEndpoint, TagsResourceInput } from "./utils/types";

export class MessageBus {
    private static infrastructure = new Infrastructure();

    public static configureTags(tags: TagsResourceInput) {
        Configuration.pushTags(tags);
        return this;
    }

    public static async configureEndpoints(endpoints: ConfigureEndpoint) {
        for(const endpoint of endpoints) {
            await this.infrastructure.createQueue(endpoint.Queue);
            await this.infrastructure.bindTopic({
                QueueName: endpoint.Queue,
                TopicName: endpoint.Topic
            });
        }
    }
}