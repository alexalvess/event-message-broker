export type GenericMessage = {
    Timestamp: Date;
    CorrelationId: string;
}

export type BindTopicInput = {
    TopicName: string;
    QueueName: string;
}

export type TagsResourceInput = Array<{
    Key: string;
    Value: string;
}>

export class ScheduleInput<TMessage extends Object> {
    Message: TMessage;
    ScheduleDate: Date;
    TopicName: string;
}

export interface MessageContext<TMessage extends object> {
    Content: TMessage;
}

export type SecondLevelResilienceInput<TMessageContext extends MessageContext<TMessage>, TMessage extends Object> = {
    QueueName: string;
    Message: TMessageContext;
    MaxRetryCount: number;
    DelaySeconds: number;
}

export type RedeliveryInput<TMessageContext extends MessageContext<TMessage>, TMessage extends Object> = {
    QueueName: string;
    Message: TMessageContext;
    DelaySeconds: number;
    Params?: {}
}

export class ConsumerParams<TMessage extends Object> {
    Endpoint: string;
    handle: (message: MessageContext<TMessage>) => Promise<void>;
    MaxRetryCount: number = 0;
    DelaySeconds: number = 0;
}