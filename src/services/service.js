const snsService = require('./sns.service');
const sqsService = require('./sqs.service');
const eventBridgeService = require('./eventBridge.service');

async function publishMessage(topicName, contentMessage) {
    await snsService.publishMessage(topicName, contentMessage);
}

async function sendMessage(queueName, contentMessage, params) {
    sqsService.sendMessageQueue(queueName, contentMessage, params);
}

async function scheduleMessage(topicName, message, scheduleDate) {
    await eventBridgeService.scheduleMessage(topicName, message, scheduleDate);
}

async function handleConsumerMessage(queueName, resilienceParams) {
    await sqsService.consumeMessages(queueName, resilienceParams);
}

module.exports = {
    publishMessage,
    sendMessage,
    scheduleMessage,
    handleConsumerMessage
}