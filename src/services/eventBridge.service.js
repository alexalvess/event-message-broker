const aws = require('aws-sdk');
const uuid = require('uuid');
const config = require('../config.json');

const eventBridge = new aws.EventBridge();

async function scheduleMessage(topicName, message, scheduleDate) {
    const topicArn = `${config.snsArnPrefix}:${topicName}`;
    const id = uuid.v4();

    const subtractDates = Math.abs(scheduleDate - new Date());
    const scheduleMinutes = Math.floor((subtractDates/1000)/60);

    await eventBridge.putRule({
        Name: id,
        ScheduleExpression: `rate(${scheduleMinutes} minute${scheduleMinutes > 1 ? 's' : ''})`,
        State: 'ENABLED',
        Tags: config.tags
    }).promise();

    await eventBridge.putTargets({
        Rule: id,
        Targets: [
            {
                Id: id,
                Arn: topicArn,
                Input: JSON.stringify({
                    scheduleId: id,
                    ...message
                })
            }
        ],
    }).promise();

    await eventBridge.putEvents({
        Entries: [
            {
                Source: id,
                DetailType: 'planner'
            }
        ],
    }).promise();

    console.log('\x1b[32m%s\x1b[0m', `Schedule message ${topicName} to ${scheduleDate.toLocaleString()} (${scheduleMinutes} minutes):`, id);
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