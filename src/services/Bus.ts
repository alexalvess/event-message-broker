import { ConsumerParams, RedeliveryInput, ScheduleInput } from "../utils/types";
import { EventBridgeService } from "./EventBridgeService"
import { SNSService } from "./SNSService";
import { SQSService } from "./SQSService";

export class Bus {
    private static readonly eventBridge = new EventBridgeService();
    private static readonly sqs = new SQSService();
    private static readonly sns = new SNSService();

    public static async publish<TMessage extends Object>(topicName: string, message: TMessage) {
        return await this.sns.publish(topicName, message);
    }

    public static async send<TMessage extends Object>(queueName: string, message: TMessage, params?: {}){
        return await this.sqs.send(queueName, message, params);
    }

    public static async redelivery<TMessage extends Object>(params: RedeliveryInput<TMessage>) {
        return await this.sqs.redelivery(params);
    }

    public static async schedule<TMessage extends Object>(params: ScheduleInput<TMessage>) {
        return await this.eventBridge.schedule(params);
    }

    public static async updateSchedule<TMessage extends Object>(name: string, params: ScheduleInput<TMessage>) {
        return await this.eventBridge.update(name, params);
    }

    public static async deleteSchedule(name: string) {
        return await this.eventBridge.delete(name);
    }

    public static consume<TMessage extends Object>(params: ConsumerParams<TMessage>){
        return this.sqs.consume(params);
    }
}