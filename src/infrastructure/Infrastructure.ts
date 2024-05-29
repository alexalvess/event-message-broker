import { BindTopicInput, TagsResourceInput } from "../utils/types";
import { SNSInfrastructure } from "./SNSInfrastructure";
import { SQSInfrastructure } from "./SQSInfrastructure";

export class Infrastructure{
    private readonly sns: SNSInfrastructure;
    private readonly sqs: SQSInfrastructure;

    constructor() {
        this.sns = new SNSInfrastructure();
        this.sqs = new SQSInfrastructure();
    }

    public async createQueue(queueName: string, tags?: TagsResourceInput) {
        await this.sqs.create(queueName, tags);
    }

    public async bindTopic(binder: BindTopicInput) {
        const topicOutput = await this.sns.create(binder.TopicName, binder.Tags);

        if(topicOutput.Created) {
            await this.sqs.linkTopicQueuePolicy(binder.QueueName, binder.TopicName);
            await this.sns.subscribeEndpoints(binder.TopicName, binder.QueueName);
        }
    }
}