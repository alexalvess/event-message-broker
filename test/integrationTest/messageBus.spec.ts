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
    it(Bus.publish.name, async () => {
        const message = { 
            Timestamp: new Date(),
            Username: 'Teste'
        };

        const output = await Bus.publish(topicName, message);

        expect(output).not.toBeNull();
    });
});