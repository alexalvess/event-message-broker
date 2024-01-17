const { configureContainer, stopContainer } = require('../bootstrap/aws.service.config');
const { SQS } = require('aws-sdk');
const config = require('../../../src/config.json')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100_000;

describe('SQS service tests', () => {
    beforeAll(async () => await configureContainer('sqs'));
    afterAll(async () => await stopContainer());

    it('Send to unexist SQS queue', async () => {
        const queueName = 'my-test-queue';
        const message = { message: 'test' }

        const { sendMessageQueue } = require('../../../src/services/sqs.service');

        const result = await sendMessageQueue(queueName, message);

        expect(result).toBeUndefined();
    });

    it('Send to exist SQS queue', async () => {
        const queueName = 'my-test-queue';
        const message = { message: 'test' }

        const { createQueue } = require('../../../src/infrastructure/sqs.infra');
        const { sendMessageQueue } = require('../../../src/services/sqs.service');

        await createQueue(queueName);
        const result = await sendMessageQueue(queueName, message);

        expect(result).not.toBeUndefined();
    });

    it('Consume a message in SQS queue', async () => {
        const queueName = 'my-test-queue';
        const message = { message: 'test' }

        const { createQueue } = require('../../../src/infrastructure/sqs.infra');
        const { sendMessageQueue, consumeMessages } = require('../../../src/services/sqs.service');

        const queues = await createQueue(queueName);
        const result = await sendMessageQueue(queueName, message);

        expect(result).toBeDefined();

        consumeMessages(
            queueName, 
            { maxRetryCount: 3, delaySeconds: 5 },
            (message) => {
                expect(message).toBeDefined();
            });

        await new Promise((resolve) => setTimeout(resolve, 1000));
    });
})