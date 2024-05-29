import { Bus, MessageBus } from '../../src/index';
const queueName = 'my-test-queue';
const topicName = 'my-test-topic'


describe('Infrastructure', () => {
    it('Create SQS Queue and SNS Topic', async () => {
        await MessageBus.configureEndpoints([
            {
                Queue: queueName,
                Topic: topicName
            }
        ]);
    });
});

describe('Service', () => {
    it('Publish a message', async () => {
        const message = { 
            Timestamp: new Date(),
            Username: 'Teste'
        };

        const output = await Bus.publish(topicName, message);

        expect(output).not.toBeNull();
    });
});