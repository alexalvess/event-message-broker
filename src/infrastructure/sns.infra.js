const aws = require('aws-sdk');
const config = require('../config.json');

const sns = new aws.SNS();

async function createSnsTopic(topicName) {
    try {
        const result = await sns.createTopic({ Name: topicName }).promise();
        console.log('Topic created successfully:', result.TopicArn);
        return result.TopicArn;
    } catch (error) {
        console.error('Erro when try to create a topic:', error.message);
        throw error;
    }    
}

async function subscribeSnsTopicInQueue(topicName, queueName) {
    const params = {
        Protocol: 'sqs',
        TopicArn: `${config.snsArnPrefix}:${topicName}`,
        Endpoint: `${config.sqsArnPrefix}:${queueName}`,
    };

    try {
        const subscriber = await sns.subscribe(params).promise();
        console.log('Subscriber created:', subscriber.SubscriptionArn);
        return subscriber.SubscriptionArn;
    } catch (error) {
        console.error('Error to create a subscriber:', error.message);
        throw error;
    }
}

module.exports = { 
    createSnsTopic, 
    subscribeSnsTopicInQueue 
};