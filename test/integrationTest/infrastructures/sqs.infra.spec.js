const { configureContainer, stopContainer } = require('../bootstrap/aws.service.config');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100_000;

describe('SQS infrastructure tests', () => {
    beforeAll(async () => await configureContainer('sqs'));
    afterAll(async () => await stopContainer());

    it('Create SQS queue', async () => {
        const queueName = 'my-test-queue';

        const { createQueue } = require('../../../src/infrastructure/sqs.infra');

        const result = await createQueue(queueName);

        expect(result).toHaveSize(2);
    })
})