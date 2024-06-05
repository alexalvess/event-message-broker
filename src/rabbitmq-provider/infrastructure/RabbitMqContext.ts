import amqp, { Channel, Connection } from "amqplib";
import { Configuration } from "../../application/utils/Configuration";

export class RabbitMqContext {
    public static async configureContext() {
        if(!process.env.RABBITMQ_CONNECTION) {
            throw new Error('Connection string not found.')
        }

        const connection: Connection = await amqp.connect(process.env.RABBITMQ_CONNECTION);
        const channel: Channel = await connection.createChannel();
        channel.prefetch(Configuration.prefetch);

        return channel;
    }
}