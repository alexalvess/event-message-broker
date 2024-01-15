const snsInfra = require('./sns.infra');
const sqsInfra = require('./sqs.infra');

async function createQueue(queueName) {
    await sqsInfra.createQueue(queueName);
}

async function bindTopic(topicName, queueName) {
    await snsInfra.createSnsTopic(topicName);
    await snsInfra.subscribeSnsTopicInQueue(topicName, queueName);
}

module.exports = {
    createQueue,
    bindTopic
}