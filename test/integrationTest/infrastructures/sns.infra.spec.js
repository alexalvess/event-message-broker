const { configureContainer, stopContainer } = require('../bootstrap/aws.service.config');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100_000;

describe('SNS infrastructure tests', () => {
    beforeAll(async () => await configureContainer('sns'));
    afterAll(async () => await stopContainer());

    it('Create SNS topic', async () => {
        const topicName = 'my-test-topic';

        const { createSnsTopic } = require('../../../src/infrastructure/sns.infra');

        const result = await createSnsTopic(topicName);

        expect(result).not.toBeUndefined();
    });

    it('Subscribe SNS topic', async () => {
        const topicName = 'my-test-topic';
        const queueName = 'my-test-queue';

        const { subscribeSnsTopicInQueue } = require('../../../src/infrastructure/sns.infra');

        const result = await subscribeSnsTopicInQueue(topicName, queueName);

        expect(result).not.toBeUndefined();
    });
})