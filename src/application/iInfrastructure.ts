import { BindTopicInput } from "./utils/types";

export interface IInfrastructure {
    createQueue(queueName: string): Promise<void>;
    bindTopic(binder: BindTopicInput): Promise<void>;
}