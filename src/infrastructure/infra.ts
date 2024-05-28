import { createSnsTopic, subscribeSnsTopicInQueue } from './sns.infra';
import { createSqsQueue } from './sqs.infra';

export async function createQueue(queueName: string) {
    await createSqsQueue(queueName);
}

export async function bindTopic(topicName: string, queueName: string) {
    await createSnsTopic(topicName);
    await subscribeSnsTopicInQueue(topicName, queueName);
}