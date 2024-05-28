import {
    SQSClient,
    SetQueueAttributesCommand,
    ListQueuesCommand,
    CreateQueueCommand
} from "@aws-sdk/client-sqs";

import {
    QUEUE_ARN_TEMPLATE,
    QUEUE_URL_TEMPLATE,
    TOPIC_ARN_TEMPLATE
} from "../utils/constants";
import { CreateQueueOutput } from "../utils/types";

export class SQSInfrastructure {
    private readonly client: SQSClient;

    constructor() {
        this.client = new SQSClient();
    }

    public async create(queueName: string): Promise<CreateQueueOutput> {
        const exists = await this.check(queueName);

        if(!exists) {
            const queueCommand = new CreateQueueCommand({ QueueName: queueName });
            const dlqCommand = new CreateQueueCommand({ QueueName: queueName + '-dlq' });

            await Promise.all([
                this.client.send(queueCommand),
                this.client.send(dlqCommand)
            ]);
        }        

        return {
            QueueArn: QUEUE_ARN_TEMPLATE.replace('[queueName]', queueName),
            QueueUrl: QUEUE_URL_TEMPLATE.replace('[queueName]', queueName),
            Created: !exists
        }
    }

    public async linkTopicQueuePolicy(queueName: string, topicName: string) {
        const queueUrl = QUEUE_URL_TEMPLATE.replace('[queueName]', queueName)
        const queueArn = QUEUE_ARN_TEMPLATE.replace('[queueName]', queueName);
        const topicArn = TOPIC_ARN_TEMPLATE.replace('[topicName]', topicName);

        const policy = await import('./sqsPolicy.json');
        policy.Statement[0].Resource = queueArn;
        policy.Statement[0].Condition.ArnEquals["aws:SourceArn"] = topicArn;

        const command = new SetQueueAttributesCommand({
            QueueUrl: queueUrl,
            Attributes: {
                Policy: JSON.stringify(policy)
            }
        });

        await this.client.send(command);
    }

    private async createDlqPolicy() {

    }

    private async tag() {

    }

    private async check(queueName: string) {
        const command = new ListQueuesCommand({ QueueNamePrefix: queueName });
        const output = await this.client.send(command);
        
        return output.QueueUrls ? true : false;
    }
}