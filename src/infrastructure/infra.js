const snsInfra = require('./sns.infra');
const sqsInfra = require('./sqs.infra');

async function createQueue(queueName) {
    await sqsInfra.createQueue(queueName);
}

async function createTopic(topicName) {
    await snsInfra.createTopic(topicName);
}

async function bindTopic(topicName, queueName) {
    await snsInfra.subscribeSnsTopicInQueue(topicName, queueName);
}

module.exports = {
    createQueue,
    createTopic,
    bindTopic
}