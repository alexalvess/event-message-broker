import { BindTopicInput } from "./utils/types";

export interface IInfrastructure {
    use(): Promise<IInfrastructure>;
    createQueue(queueName: string): Promise<void>;
    bindTopic(binder: BindTopicInput): Promise<void>;
}