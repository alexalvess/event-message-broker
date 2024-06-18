import amqp, { Channel, Connection } from "amqplib";
import { Configuration } from "../../application/utils/Configuration";

export class RabbitMqContext {
    public static async configureContext() {
        const host = process.env.RABBITMQ_HOST;
        const port = process.env.RABBITMQ_PORT;
        const user = process.env.RABBITMQ_USER;
        const pass = process.env.RABBITMQ_PASS;

        const connectionString = `amqp://${user}:${pass}@${host}:${port}`;

        const connection: Connection = await amqp.connect(connectionString);
        const channel: Channel = await connection.createChannel();
        channel.prefetch(Configuration.prefetch);

        return channel;
    }
}