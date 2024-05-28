import { SNS } from 'aws-sdk';
import config from '../config.json';
import { logInformation, logError } from '../utils/log';

const sns = new SNS();

export async function createSnsTopic(topicName: string) {
    try {
        const result = await sns.createTopic({ Name: topicName, Tags: config.tags }).promise();

        logInformation('Topic created successfully:', result.TopicArn)
        return result.TopicArn;
    } catch (error) {
        logError('Erro when try to create a topic:', error);
        throw error;
    }
}

export async function subscribeSnsTopicInQueue(topicName: string, queueName: string) {
    const params = {
        Protocol: 'sqs',
        TopicArn: `${config.snsArn}:${config.region}:${config.account}:${topicName}`,
        Endpoint: `${config.sqsArn}:${config.region}:${config.account}:${queueName}`,
    };

    try {
        const subscriber = await sns.subscribe(params).promise();
        logInformation('Subscriber created:', subscriber.SubscriptionArn);
        return subscriber.SubscriptionArn;
    } catch (error: any) {
        logError('Error to create a subscriber:', error.message);
        throw error;
    }
}