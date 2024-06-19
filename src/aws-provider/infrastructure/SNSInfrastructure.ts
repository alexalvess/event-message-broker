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
    CreateTopicOutput
} from '../utils/types';
import { Configuration } from '../../application/utils/configuration';
import { Span } from '@opentelemetry/api';

export class SNSInfrastructure {
    private readonly client: SNSClient;

    constructor() {
        this.client = new SNSClient();
    }

    public async create(topicName: string, span: Span): Promise<CreateTopicOutput> {
        span.setAttribute('topic', topicName);

        const exists = await this.check(topicName);

        span.addEvent(exists ? 'topic-already-created' : 'topic-does-not-exists');

        if(!exists) {
            const command = new CreateTopicCommand({ Name: topicName });
            
            const output = await this.client.send(command);
            span.addEvent('topic-created', { arn: output.TopicArn });

            const tags = await this.tag(topicName);
            span.addEvent('topic-tags-attached', { tags: JSON.stringify(tags) });
        }
    
        return {
            TopicArn: TOPIC_ARN_TEMPLATE(topicName),
            Created: !exists
        };
    }

    public async subscribeEndpoints(topicName: string, queueName: string): Promise<string | undefined> {
        const command = new SubscribeCommand({
            TopicArn: TOPIC_ARN_TEMPLATE(topicName),
            Endpoint: QUEUE_ARN_TEMPLATE(queueName),
            Protocol: 'sqs'
        });

        const output = await this.client.send(command);
        return output.SubscriptionArn;
    }

    private async tag(topicName: string) {
        if(!Configuration.tags || Configuration.tags.length < 1) {
            return;
        }

        const command = new TagResourceCommand({
            ResourceArn: TOPIC_ARN_TEMPLATE(topicName),
            Tags: Configuration.tags
        });
        
        await this.client.send(command);
        return Configuration.tags;
    }

    private async check(topicName: string): Promise<boolean> {
        try {
            const topicArn = TOPIC_ARN_TEMPLATE(topicName);
            const command = new GetTopicAttributesCommand({ TopicArn: topicArn });
            await this.client.send(command);

            return true;
        } catch (error: any) {
            return false;
        }
    }
}