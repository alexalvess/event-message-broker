const { EventBridge } = require('aws-sdk');
const config = require('../config.json');
const { logInformation, logError } = require('../utils/log');
const { createRule } = require('../infrastructure/eventBridge.infra');

const eventBridge = new EventBridge();

async function scheduleMessage(topicName, message, scheduleDate) {
    const topicArn = `${config.snsArn}:${config.region}:${config.account}:${topicName}`;

    const rule = await createRule(scheduleDate);

    const targets = await eventBridge.putTargets({
        Rule: rule.id,
        Targets: [
            {
                Id: rule.id,
                Arn: topicArn,
                Input: JSON.stringify({
                    scheduleId: rule.id,
                    ...message
                })
            }
        ],
    }).promise();

    const events = await eventBridge.putEvents({
        Entries: [
            {
                Source: rule.id,
                DetailType: 'planner'
            }
        ],
    }).promise();

    logInformation(`Message ${rule.id} scheduled`);
    
    return {
        ...rule,
        targets: { ...targets },
        events: { ...events }
    }
}

async function deleteEventBridgeRule(queueName, ruleName) {
    try {
        await eventBridge.removeTargets({ Rule: ruleName, Ids: [ruleName] }).promise();
        await eventBridge.deleteRule({ Name: ruleName }).promise();
        logInformation(`Deleting schedule rule from ${queueName}:`, ruleName);
    } catch (error) {
        logError(`Error trying delete rule from ${queueName}`, error.message)   
    }
}

module.exports = { scheduleMessage, deleteEventBridgeRule }