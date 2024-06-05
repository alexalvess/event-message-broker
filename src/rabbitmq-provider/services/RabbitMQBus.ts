import { IBus } from "../../application/iBus";
import { GenericMessage, MessageContext, RedeliveryInput, ScheduleInput, ConsumerParams } from "../../application/utils/types";

export class RabbitMQBus implements IBus {
    public async publish<TMessage extends GenericMessage>(topicName: string, message: TMessage): Promise<void> {

    }
    public async send<TMessage extends GenericMessage>(queueName: string, message: TMessage, params?: {}): Promise<void> {

    }
    public async redelivery<TMessageContext extends MessageContext<TMessage>, TMessage extends GenericMessage>(params: RedeliveryInput<TMessageContext, TMessage>): Promise<void> {

    }
    public async schedule<TMessage extends GenericMessage>(params: ScheduleInput<TMessage>): Promise<void> {

    }
    public consume<TMessage extends GenericMessage>(params: ConsumerParams<TMessage>): void {

    }
    
}