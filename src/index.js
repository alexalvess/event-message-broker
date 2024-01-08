const aws = require('aws-sdk');
const config = require('./config.json');

aws.config.update({
    endpoint: config.endpoint,
    region: config.region,
});

const snsInfra = require('./infrastructure/sns.infra');
const sqsInfra = require('./infrastructure/sqs.infra');

const snsService = require('./services/sns.service');
const sqsService = require('./services/sqs.service');
const eventBridgeService = require('./services/eventBridge.service');

async function scheduleMessage(topicName, message, scheduleDate) {
    await eventBridgeService.scheduleMessage(topicName, message, scheduleDate);
}

module.exports = {
    snsInfra,
    sqsInfra,
    snsService,
    sqsService,
    scheduleMessage
}