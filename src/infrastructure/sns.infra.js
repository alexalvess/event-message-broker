const aws = require('aws-sdk');
const config = require('../config.json');

const sns = new aws.SNS();

async function createSnsTopic(topicName) {
    try {
        await sns.createTopic({ Name: topicName }).promise();
        console.log('Topic created successfully:', topicName);
    } catch (error) {
        console.error('Erro when try to create a topic:', error.message);
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
    } catch (error) {
        console.error('Error to create a subscriber:', error.message);
    }
}

module.exports = { 
    createSnsTopic, 
    subscribeSnsTopicInQueue 
};