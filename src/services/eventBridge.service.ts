import { EventBridge } from 'aws-sdk';
import { logInformation, logError } from '../utils/log';
import { createRule } from '../infrastructure/eventBridge.infra';
import { TOPIC_ARN_TEMPLATE } from '../utils/constants';

const eventBridge = new EventBridge();

export async function scheduleMessage(topicName: string, message: any, scheduleDate: Date) {
    const topicArn = TOPIC_ARN_TEMPLATE.replace('[topicName]', topicName);

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

export async function deleteEventBridgeRule(queueName: string, ruleName: string) {
    try {
        await eventBridge.removeTargets({ Rule: ruleName, Ids: [ruleName] }).promise();
        await eventBridge.deleteRule({ Name: ruleName }).promise();
        logInformation(`Deleting schedule rule from ${queueName}:`, ruleName);
    } catch (error: any) {
        logError(`Error trying delete rule from ${queueName}`, error.message);
    }
}