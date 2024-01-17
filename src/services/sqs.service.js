const { SQS } = require('aws-sdk');
const config = require('../config.json');
const { Consumer } = require('sqs-consumer');
const eventBridgeService = require('./eventBridge.service');
const { logInformation, logError, logWarning } = require('../utils/log');

const sqs = new SQS();

async function sendMessageQueue(queueName, contentMessage, sendParams) {
    const params = {
        MessageBody: JSON.stringify(contentMessage),
        MessageAttributes: {
            'RetryCount': {
                DataType: 'Number',
                StringValue: '0'
            }
        },
        QueueUrl: `http://sqs.${config.region}.${config.awsHost}:${config.port}/${config.account}/${queueName}`,
        ...sendParams
    };

    try {
        const data = await sqs.sendMessage(params).promise();
        logInformation(`Sent SQS message to ${queueName}: `, data.MessageId);
        return data.MessageId;
    } catch (error) {
        logError('Error to send message', error.message);
    }
}

async function consumeMessages(queueName, resilienceParams, handle) {
    const consumer = Consumer.create({
        messageAttributeNames: [ 'All' ],
        queueUrl: `http://sqs.${config.region}.${config.awsHost}:${config.port}/${config.account}/${queueName}`,
        handleMessage: async message => {
            try {
                const messageContent = JSON.parse(message.Body);

                if(messageContent.Type === 'Notification') {
                    messageContent = JSON.parse(messageContent.Message);
                }

                if(messageContent.scheduleId) {
                    await eventBridgeService.deleteEventBridgeRule(queueName, messageContent.scheduleId);
                }

                handle(messageContent);

                logInformation(`Message consumed from ${queueName}`);
            } catch (error) {
                logError(`Error processing message from ${queueName}:`, error.message);
                executeSecondLevelResilience(queueName, message, resilienceParams.maxRetryCount, resilienceParams.delaySeconds);
            }
        },
        sqs: sqs,
        batchSize: 10
    });

    consumer.start();
}

function executeSecondLevelResilience(queueName, message, maxRetryCount, delaySeconds) {
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

module.exports = { sendMessageQueue, consumeMessages }