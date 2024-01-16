const { SQS } = require('aws-sdk');
const config = require('../config.json');
const { Consumer } = require('sqs-consumer');
const eventBridgeService = require('./eventBridge.service');

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
        QueueUrl: `${config.queuUrlPrefix}/${queueName}`,
        ...sendParams
    };

    try {
        const data = await sqs.sendMessage(params).promise();
        console.log('\x1b[33m%s\x1b[0m', `Sent SQS message to ${queueName}: `, data.MessageId);
        return data.MessageId;
    } catch (error) {
        console.log('Error to send message', error.message);
    }
}

async function consumeMessages(queueName, resilienceParams) {
    const consumer = Consumer.create({
        messageAttributeNames: [ 'All' ],
        queueUrl: `${config.queuUrlPrefix}/${queueName}`,
        handleMessage: async message => {
            try {
                const body = JSON.parse(message.Body);

                if(body.Message) {
                    const messageContent = JSON.parse(body.Message);
                    if(messageContent.scheduleId){
                        console.info('\x1b[36m%s\x1b[0m', `Message consumed from ${queueName}`, messageContent.scheduleId);
                        await eventBridgeService.deleteEventBridgeRule(queueName, messageContent.scheduleId);
                    }
                    else {
                        console.info('\x1b[36m%s\x1b[0m', `Message consumed from ${queueName}`, message.MessageId);
                    }
                }
            } catch (error) {
                console.log('\x1b[31m%s\x1b[0m', `Error processing message from ${queueName}:`, error.message);
                executeSecondLevelResilience(queueName, message, resilienceParams.maxRetryCount, resilienceParams.delaySeconds);
            }
        },
        sqs: sqs,
        batchSize: 10
    });

    consumer.on('error', error => {
        console.log(`Error consuming message`, error);
    });

    consumer.start();
}

function executeSecondLevelResilience(queueName, message, maxRetryCount, delaySeconds) {
    let retryCount = message.MessageAttributes && parseInt(message.MessageAttributes['RetryCount'].StringValue);
    
    if (retryCount <= maxRetryCount) {
        console.log(`Retry count: ${retryCount}`);
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