import { Message } from "@aws-sdk/client-sqs";
import { MessageContext } from "../../application/utils/types";


export type ConfigureEndpoint = Array<{
    Queue: string,
    Topic: string
}>;

export type CreateQueueOutput = {
    QueueArn: string;
    QueueUrl: string;
    Created: boolean;
}

export type CreateTopicOutput = {
    TopicArn: string;
    Created: boolean;
};

export interface AWSMessageContext<TMessage extends object> 
    extends MessageContext<TMessage>, Message{};

export class ScheduleOutput {
    Id: string;
    ScheduleArn: string | undefined;
}