const { EventBridge } = require('aws-sdk');
const uuid = require('uuid');
const config = require('../config.json');

const eventBridge = new EventBridge();

async function createRule(scheduleDate) {
    const id = uuid.v4();

    const subtractDates = Math.abs(scheduleDate - new Date());
    let scheduleMinutes = Math.floor((subtractDates/1000)/60);
    scheduleMinutes = scheduleMinutes == 0 ? 1 : scheduleMinutes;

    const rule = await eventBridge.putRule({
        Name: id,
        ScheduleExpression: `rate(${scheduleMinutes} minute${scheduleMinutes > 1 ? 's' : ''})`,
        State: 'ENABLED'
    }).promise();

    console.log(`Rule ${id} - ${rule.RuleArn} CREATED`);

    return {
        id: id,
        ruleArn: rule.RuleArn
    };
}

module.exports = { createRule }