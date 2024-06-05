import { BindTopicInput } from "../aws-provider/utils/types";

export interface IInfrastructure {
    createQueue(queueName: string): Promise<void>;
    bindTopic(binder: BindTopicInput): Promise<void>;
}