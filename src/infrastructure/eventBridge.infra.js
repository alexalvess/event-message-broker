const aws = require('aws-sdk');
const uuid = require('uuid');
const config = require('../config.json');

const eventBridge = new aws.EventBridge();

async function createRule(scheduleDate) {
    const id = uuid.v4();

    const subtractDates = Math.abs(scheduleDate - new Date());
    const scheduleMinutes = Math.floor((subtractDates/1000)/60);

    const rule = await eventBridge.putRule({
        Name: id,
        ScheduleExpression: `rate(${scheduleMinutes} minute${scheduleMinutes > 1 ? 's' : ''})`,
        State: 'ENABLED'
    }).promise();

    return {
        id: id,
        rulearn: rule.RuleArn
    };
}

module.exports = { createRule }