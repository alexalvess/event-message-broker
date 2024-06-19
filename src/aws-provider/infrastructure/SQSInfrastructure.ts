import {
    SQSClient,
    SetQueueAttributesCommand,
    ListQueuesCommand,
    CreateQueueCommand,
    TagQueueCommand
} from "@aws-sdk/client-sqs";

import {
    QUEUE_ARN_TEMPLATE,
    QUEUE_URL_TEMPLATE,
    TOPIC_ARN_TEMPLATE
} from "../utils/constants";

import { CreateQueueOutput } from '../utils/types';
import { Configuration } from "../../application/utils/configuration";
import { Span } from '@opentelemetry/api';

export class SQSInfrastructure {
    private readonly client: SQSClient;

    constructor() {
        this.client = new SQSClient();
    }

    public async create(queueName: string, span: Span): Promise<CreateQueueOutput> {
        span.setAttribute('queue', queueName);

        const exists = await this.check(queueName);

        span.addEvent(exists ? 'queue-already-created' : 'queue-does-not-exists');

        if (!exists) {
            const queueCommand = new CreateQueueCommand({ QueueName: queueName });
            const dlqCommand = new CreateQueueCommand({ QueueName: queueName + '-dlq' });

            await Promise.all([
                async () => {
                    const output = await this.client.send(queueCommand);
                    span.addEvent('queue-created', { url: output.QueueUrl });
                },
                async () => {
                    const output = await this.client.send(dlqCommand);
                    span.addEvent('dlq-created', { url: output.QueueUrl });
                }
            ]);

            await Promise.all([
                async () => {
                    const tags = await this.tag(queueName);
                    span.addEvent('queue-tags-attached', { tags: JSON.stringify(tags) })
                },
                async () => {
                    const tags = await this.tag(queueName + '-dlq');
                    span.addEvent('dlq-tags-attached', { tags: JSON.stringify(tags) });
                }
            ]);

            const policy = await this.createDlqPolicy(queueName);
            span.addEvent('dlq-policy-created', { policy: JSON.stringify(policy) });
        }

        return {
            QueueArn: QUEUE_ARN_TEMPLATE(queueName),
            QueueUrl: QUEUE_URL_TEMPLATE(queueName),
            Created: !exists
        }
    }

    public async linkTopicQueuePolicy(queueName: string, topicName: string) {
        const queueUrl = QUEUE_URL_TEMPLATE(queueName)
        const queueArn = QUEUE_ARN_TEMPLATE(queueName);
        const topicArn = TOPIC_ARN_TEMPLATE(topicName);

        const policy = (await import('./policies.json')).linkTopicQueuePolicy;
        policy.Statement[0].Resource = queueArn;
        policy.Statement[0].Condition.ArnEquals["aws:SourceArn"] = topicArn;

        const command = new SetQueueAttributesCommand({
            QueueUrl: queueUrl,
            Attributes: {
                Policy: JSON.stringify(policy)
            }
        });

        await this.client.send(command);
        return policy;
    }

    private async createDlqPolicy(queueName: string) {
        const policy = (await import('./policies.json')).redrivePolicy;
        policy.deadLetterTargetAr = QUEUE_ARN_TEMPLATE(queueName + '-dlq');

        const command = new SetQueueAttributesCommand({
            QueueUrl: QUEUE_URL_TEMPLATE(queueName),
            Attributes: { RedrivePolicy: JSON.stringify(policy) }
        });

        await this.client.send(command);
        return policy;
    }

    private async tag(queueName: string) {
        if (!Configuration.tags || Configuration.tags.length < 1) {
            return;
        }

        const formatedTags = Configuration.tags.reduce((accumulator: any, current: any) => {
            accumulator[current.Key] = current.Value;
            return accumulator;
        }, {});

        const command = new TagQueueCommand({
            QueueUrl: QUEUE_URL_TEMPLATE(queueName),
            Tags: formatedTags
        });

        await this.client.send(command);
        return Configuration.tags;
    }

    private async check(queueName: string) {
        const command = new ListQueuesCommand({ QueueNamePrefix: queueName });
        const output = await this.client.send(command);

        return output.QueueUrls ? true : false;
    }
}