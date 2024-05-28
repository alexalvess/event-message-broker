import {
    QUEUE_ARN_TEMPLATE,
    TOPIC_ARN_TEMPLATE
} from '../utils/constants';

import {
    SNSClient,
    GetTopicAttributesCommand,
    CreateTopicCommand,
    TagResourceCommand,
    SubscribeCommand
} from '@aws-sdk/client-sns';

import { 
    CreateTopicOutput, 
    TagsResourceInput 
} from '../utils/types';

export class SNSInfrastructure {
    private readonly client: SNSClient;

    constructor() {
        this.client = new SNSClient();
    }

    public async create(topicName: string, tags: TagsResourceInput): Promise<CreateTopicOutput> {
        const exists = await this.check(topicName);

        if(!exists) {
            const command = new CreateTopicCommand({ Name: topicName });
            await this.client.send(command);
            await this.tag(topicName, tags);
        }
    
        return {
            TopicArn: TOPIC_ARN_TEMPLATE.replace('[topicName]', topicName),
            Created: !exists
        };
    }

    public async subscribeEndpoints(topicName: string, queueName: string): Promise<string | undefined> {
        const command = new SubscribeCommand({
            TopicArn: TOPIC_ARN_TEMPLATE.replace('[topicName]', topicName),
            Endpoint: QUEUE_ARN_TEMPLATE.replace('[queueName]', queueName),
            Protocol: 'sqs'
        });

        const output = await this.client.send(command);
    
        return output.SubscriptionArn;
    }

    private async tag(topicName: string, tags: TagsResourceInput) {
        const command = new TagResourceCommand({
            ResourceArn: TOPIC_ARN_TEMPLATE.replace('[topicName]', topicName),
            Tags: tags
        });
        
        await this.client.send(command);
    }

    private async check(topicName: string): Promise<boolean> {
        try {
            const topicArn = TOPIC_ARN_TEMPLATE.replace('[topicName]', topicName);
            const command = new GetTopicAttributesCommand({ TopicArn: topicArn });
            await this.client.send(command);

            return true;
        } catch (error: any) {
            return false;
        }
    }
}