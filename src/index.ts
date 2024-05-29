export { Bus } from './services/Bus';
import { Infrastructure } from './infrastructure/Infrastructure';
import { ConfigureEndpoint, TagsResourceInput } from "./utils/types";

export class MessageBus {
    private static infrastructure = new Infrastructure();
    private static tags?: TagsResourceInput;

    public static configureTags(tags: TagsResourceInput) {
        this.tags = tags;
        return this;
    }

    public static async configureEndpoints(endpoints: ConfigureEndpoint) {
        for(const endpoint of endpoints) {
            await this.infrastructure.createQueue(endpoint.Queue, this.tags);
            await this.infrastructure.bindTopic({
                QueueName: endpoint.Queue,
                TopicName: endpoint.Topic,
                Tags: this.tags
            });
        }
    }
}