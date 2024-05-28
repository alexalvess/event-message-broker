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

import { SNS } from 'aws-sdk';
import config from '../config.json';
import { logInformation, logError } from '../utils/log';
import { CreateTopicOutput, TagsResourceInput } from '../utils/types';

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
        TopicArn: TOPIC_ARN_TEMPLATE.replace('[topicName]', topicName),
        Endpoint: QUEUE_ARN_TEMPLATE.replace('[queueName]', queueName),
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