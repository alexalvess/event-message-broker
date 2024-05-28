import { BindTopicInput } from "../utils/types";
import { SNSInfrastructure } from "./sns.infra";

export class Infrastructure {
    private readonly sns: SNSInfrastructure;

    constructor() {
        this.sns = new SNSInfrastructure();
    }

    public async bindTopic(binder: BindTopicInput) {
        const topicOutput = await this.sns.createTopic(binder.TopicName, binder.Tags);

        if(topicOutput.Created) {
            await this.sns.subscribeEndpoints(binder.TopicName, binder.QueueName);
        }
    }
}