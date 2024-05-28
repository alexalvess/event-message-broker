import { SNS } from 'aws-sdk';
import config from '../config.json';
import { logInformation, logError } from '../utils/log';

const sns = new SNS();

export async function publishMessage(topicName: string, contentMessage: any) {
    const params = {
        TopicArn: `${config.snsArn}:${config.region}:${config.account}:${topicName}`,
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