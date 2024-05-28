import { EventBridge } from 'aws-sdk');
import {uuid} from 'uuid';
import { logInformation } = require('../utils/log');
import config = require('../config.json');

const eventBridge = new EventBridge();

async function createRule(scheduleDate) {
    const id = uuid.v4();

    const subtractDates = Math.abs(scheduleDate - new Date());
    let scheduleMinutes = Math.floor((subtractDates/1000)/60);
    scheduleMinutes = scheduleMinutes == 0 ? 1 : scheduleMinutes;

    const rule = await eventBridge.putRule({
        Name: id,
        ScheduleExpression: `rate(${scheduleMinutes} minute${scheduleMinutes > 1 ? 's' : ''})`,
        State: 'ENABLED',
        Tags: config.tags
    }).promise();

    logInformation(`Rule created`, rule.RuleArn);
    
    return {
        id: id,
        ruleArn: rule.RuleArn
    };
}

module.exports = { createRule }