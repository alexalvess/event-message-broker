const { SNS } = require('aws-sdk');
const config = require('../config.json');
const { logInformation, logError } = require('../utils/log');

const sns = new SNS();

async function createSnsTopic(topicName) {
    try {
        const result = await sns.createTopic({ Name: topicName }).promise();
        logInformation('Topic created successfully:', result.TopicArn)
        return result.TopicArn;
    } catch (error) {
        logError('Erro when try to create a topic:', error);
    }
}

async function subscribeSnsTopicInQueue(topicName, queueName) {
    const params = {
        Protocol: 'sqs',
        TopicArn: `${config.snsArn}:${config.region}:${config.account}:${topicName}`,
        Endpoint: `${config.sqsArn}:${config.region}:${config.account}:${queueName}`,
    };

    try {
        const subscriber = await sns.subscribe(params).promise();
        logInformation('Subscriber created:', subscriber.SubscriptionArn);
        return subscriber.SubscriptionArn;
    } catch (error) {
        logError('Error to create a subscriber:', error.message);
    }
}

module.exports = { 
    createSnsTopic, 
    subscribeSnsTopicInQueue 
};