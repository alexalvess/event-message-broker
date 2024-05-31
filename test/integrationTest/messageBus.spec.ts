import { v4 } from 'uuid';
import { Bus, MessageBus } from '../../src/index';

const queueName = 'my-test-queue';
const topicName = 'my-test-topic'

describe('Infrastructures', () => {
    it(MessageBus.configureEndpoints.name, async () => {
        await MessageBus.configureEndpoints([
            {
                Queue: queueName,
                Topic: topicName
            }
        ]);
    });
});

describe('Services', () => {
    it(Bus.send.name, async () => {
        const message = {
            CorrelationId: v4(),
            Timestamp: new Date(),
            Username: 'Test'
        };

        const output = await Bus.send(queueName, message);
    });

    it(Bus.publish.name, async () => {
        const message = {
            CorrelationId: v4(),
            Timestamp: new Date(),
            Username: 'Test'
        };

        const output = await Bus.publish(topicName, message);

        expect(output).not.toBeNull();
    });
});