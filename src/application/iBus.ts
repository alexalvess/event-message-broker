import { 
    ConsumerParams,
    GenericMessage, 
    MessageContext, 
    RedeliveryInput, 
    ScheduleInput 
} from "./utils/types";

export interface IBus {
    publish<TMessage extends GenericMessage>(topicName: string, message: TMessage): Promise<void>;
    send<TMessage extends GenericMessage>(queueName: string, message: TMessage, params?: {}): Promise<void>;
    redelivery<TMessageContext extends MessageContext<TMessage>, TMessage extends GenericMessage>(
        params: RedeliveryInput<TMessageContext, TMessage>): Promise<void>;
    schedule<TMessage extends GenericMessage>(params: ScheduleInput<TMessage>): Promise<void>;
    consume<TMessage extends GenericMessage>(params: ConsumerParams<TMessage>): void;
}