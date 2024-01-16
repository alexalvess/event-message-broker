const { SNS } = require('aws-sdk');
const config = require('../config.json');

const sns = new SNS();

function publishMessage(topicName, contentMessage) {
    const params = {
        TopicArn: `${config.snsArnPrefix}:${topicName}`,
        Message: JSON.stringify(contentMessage),
    };

    sns.publish(params, (err, data) => {
        if (err) {
            console.error('Error to publish in a topic:', err);
        } else {
            console.log('\x1b[33m%s\x1b[0m', 'Message published:', data.MessageId);
        }
    });
}

module.exports = { publishMessage }