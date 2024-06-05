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