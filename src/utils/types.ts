import { Message } from "@aws-sdk/client-sqs";

export type BindTopicInput = {
    TopicName: string;
    QueueName: string;
    Tags: TagsResourceInput
};

export type TagsResourceInput = Array<{
    Key: string;
    Value: string;
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

export type SecondLevelResilienceInput<TMessage extends keyof Object> = {
    QueueName: string;
    Message: MessageContext<TMessage>;
    MaxRetryCount: number;
    DelaySeconds: number;
};

export type RedeliveryInput<TMessage extends keyof Object> = {
    QueueName: string;
    Message: MessageContext<TMessage>;
    DelaySeconds: number;
    Params?: {}
};

export interface MessageContext<TMessage extends keyof Object> extends Message {
    Content: TMessage;
};

export class ConsumerParams<TMessage extends keyof Object> {
    Endpoint: string;
    handle: (message: MessageContext<TMessage>) => Promise<void>;
    MaxRetryCount: number = 0;
    DelaySeconds: number = 0;
    BatchSize: number = 10;
}