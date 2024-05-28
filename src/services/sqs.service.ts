import { SQS } from 'aws-sdk';
import { Consumer } from 'sqs-consumer';
import { deleteEventBridgeRule } from './eventBridge.service';
import { logInformation, logError, logWarning } from '../utils/log';
import { QUEUE_URL_TEMPLATE } from '../utils/constants';

const sqs = new SQS();

export async function sendMessageQueue(queueName: string, contentMessage: any, sendParams: any) {
    const params = {
        MessageBody: JSON.stringify(contentMessage),
        MessageAttributes: {
            'RetryCount': {
                DataType: 'Number',
                StringValue: '0'
            }
        },
        QueueUrl: QUEUE_URL_TEMPLATE.replace('[queueName]', queueName),
        ...sendParams
    };

    try {
        const data = await sqs.sendMessage(params).promise();
        logInformation(`Sent SQS message to ${queueName}: `, data.MessageId);
        return data.MessageId;
    } catch (error: any) {
        logError('Error to send message', error.message);
        throw error;
    }
}

export async function consumeMessages(queueName: string, resilienceParams: any, handle?: any) {
    const consumer = Consumer.create({
        messageAttributeNames: [ 'All' ],
        queueUrl: QUEUE_URL_TEMPLATE.replace('[queueName]', queueName),
        handleMessage: async (message: any) => {
            try {
                let messageContent = JSON.parse(message.Body);

                if(messageContent.Type === 'Notification') {
                    messageContent = JSON.parse(messageContent.Message);
                }

                if(messageContent.scheduleId) {
                    await deleteEventBridgeRule(queueName, messageContent.scheduleId);
                }

                handle(messageContent);

                logInformation(`Message consumed from ${queueName}`);
            } catch (error: any) {
                logError(`Error processing message from ${queueName}:`, error.message);
                executeSecondLevelResilience(queueName, message, resilienceParams.maxRetryCount, resilienceParams.delaySeconds);
            }
        },
        sqs: sqs,
        batchSize: 10
    });

    consumer.start();
}

function executeSecondLevelResilience(queueName: string, message: any, maxRetryCount: number, delaySeconds: number) {
    let retryCount = message.MessageAttributes && parseInt(message.MessageAttributes['RetryCount'].StringValue);
    
    if (retryCount <= maxRetryCount) {
        logWarning(`Retry count: ${retryCount}`);
        sendMessageQueue(queueName, message.Body, {
            DelaySeconds: delaySeconds,
            MessageAttributes: {
                'RetryCount': {
                    DataType: 'Number',
                    StringValue: (retryCount + 1).toString()
                }
            }
        });
    } else {
        sendMessageQueue(`${queueName}-dlq`, message.Body, {
            MessageAttributes: {
                'RetryCount': {
                    DataType: 'Number',
                    StringValue: maxRetryCount.toString()
                }
            }
        });
    }
}