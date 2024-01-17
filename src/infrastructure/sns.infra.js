const { SNS } = require('aws-sdk');
const config = require('../config.json');

const sns = new SNS();

async function createSnsTopic(topicName) {
    try {
        const result = await sns.createTopic({ Name: topicName }).promise();
        console.log('Topic created successfully:', result.TopicArn);
        return result.TopicArn;
    } catch (error) {
        console.error('Erro when try to create a topic:', error);
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
        console.log('Subscriber created:', subscriber.SubscriptionArn);
        return subscriber.SubscriptionArn;
    } catch (error) {
        console.error('Error to create a subscriber:', error.message);
    }
}

module.exports = { 
    createSnsTopic, 
    subscribeSnsTopicInQueue 
};