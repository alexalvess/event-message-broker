import { SNS } from 'aws-sdk';
import { logInformation, logError } from '../utils/log';
import { TOPIC_ARN_TEMPLATE } from '../utils/constants';

const sns = new SNS();

export async function publishMessage(topicName: string, contentMessage: any) {
    const params = {
        TopicArn: TOPIC_ARN_TEMPLATE.replace('[topicName]', topicName),
        Message: JSON.stringify(contentMessage),
    };

    try {
        const published = await sns.publish(params).promise();
        logInformation('\x1b[33m%s\x1b[0m', ['Message published:', published.MessageId]);
        return published.MessageId;
    } catch (error: any) {
        logError('Error to publish in a topic:', error.message);
        throw error;
    }
}