import { ConsumeMessage } from "amqplib";
import { MessageContext } from "../../application/utils/types";

export interface RabbitMqMessageContext<TMessage extends object> 
    extends MessageContext<TMessage>, ConsumeMessage{};