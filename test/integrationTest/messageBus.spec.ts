import './bootstrap/aws.config';
import { v4 } from 'uuid';
import { MessageBus } from '../../src/index';

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
    it(MessageBus.Bus.send.name, async () => {
        const message = {
            CorrelationId: v4(),
            Timestamp: new Date(),
            Username: 'Test'
        };

        const output = await MessageBus.Bus.send(queueName, message);
    });

    it(MessageBus.Bus.publish.name, async () => {
        const message = {
            CorrelationId: v4(),
            Timestamp: new Date(),
            Username: 'Test'
        };

        const output = await MessageBus.Bus.publish(topicName, message);

        expect(output).not.toBeNull();
    });
});