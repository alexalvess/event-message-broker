import * as snsService from './sns.service';
import * as sqsService from './sqs.service';
import * as eventBridgeService from './eventBridge.service';

export async function publishMessage(topicName: string, contentMessage: any) {
    await snsService.publishMessage(topicName, contentMessage);
}

export async function sendMessage(queueName: string, contentMessage: any, params: any) {
    await sqsService.sendMessageQueue(queueName, contentMessage, params);
}

export async function scheduleMessage(topicName: string, message: any, scheduleDate: Date) {
    await eventBridgeService.scheduleMessage(topicName, message, scheduleDate);
}

export async function handleConsumerMessage(queueName: string, resilienceParams: any) {
    await sqsService.consumeMessages(queueName, resilienceParams);
}