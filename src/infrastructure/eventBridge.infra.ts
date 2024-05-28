import { EventBridge } from 'aws-sdk';
import { v4 } from 'uuid';
import { logInformation } from '../utils/log';
import config from '../config.json';

const eventBridge = new EventBridge();

export async function createRule(scheduleDate: Date) {
    const id = v4();

    const subtractDates = Math.abs(scheduleDate.getTime() - new Date().getTime());
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