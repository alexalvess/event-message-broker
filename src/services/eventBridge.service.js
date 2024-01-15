const aws = require('aws-sdk');
const config = require('../config.json');

const { createRule } = require('../infrastructure/eventBridge.infra');

const eventBridge = new aws.EventBridge();

async function scheduleMessage(topicName, message, scheduleDate) {
    const topicArn = `${config.snsArnPrefix}:${topicName}`;

    const scheduleId = await createRule(scheduleDate);

    await eventBridge.putTargets({
        Rule: scheduleId,
        Targets: [
            {
                Id: id,
                Arn: topicArn,
                Input: JSON.stringify({
                    scheduleId: scheduleId,
                    ...message
                })
            }
        ],
    }).promise();

    await eventBridge.putEvents({
        Entries: [
            {
                Source: scheduleId,
                DetailType: 'planner'
            }
        ],
    }).promise();

    console.log('\x1b[32m%s\x1b[0m', `Schedule message ${topicName} to ${scheduleDate.toLocaleString()}`, scheduleId);
}

async function deleteEventBridgeRule(queueName, ruleName) {
    try {
        await eventBridge.removeTargets({ Rule: ruleName, Ids: [ruleName] }).promise();
        await eventBridge.deleteRule({ Name: ruleName }).promise();
        console.log('\x1b[35m%s\x1b[0m' ,`Deleting schedule rule from ${queueName}:`, ruleName);
    } catch (error) {
        console.log('\x1b[104m%s\x1b[0m', `Error trying delete rule from ${queueName}`, error.message)   
    }
}

module.exports = { scheduleMessage, deleteEventBridgeRule }