export type BindTopicInput = {
    TopicName: string;
    QueueName: string;
    Tags: TagsResourceInput
};

export type TagsResourceInput = Array<{
    Key: string;
    Value: string;
}>;

export type CreateTopicOutput = {
    TopicArn: string;
    Created: boolean;
};