const { SNS } = require('aws-sdk');
const config = require('../config.json');
const { logInformation, logError } = require('../utils/log');

const sns = new SNS();

async function publishMessage(topicName, contentMessage) {
    const params = {
        TopicArn: `${config.snsArn}:${config.region}:${config.account}:${topicName}`,
        Message: JSON.stringify(contentMessage),
    };

    try {
        const published = await sns.publish(params).promise();
        logInformation('\x1b[33m%s\x1b[0m', 'Message published:', published.MessageId);
        return published.MessageId;
    } catch (error) {
        logError('Error to publish in a topic:', error.message);
    }
}

module.exports = { publishMessage }