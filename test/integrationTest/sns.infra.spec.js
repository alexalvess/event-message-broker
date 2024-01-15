const config = require('../../src/config.json');
const { GenericContainer } = require('testcontainers');
const AWS = require('aws-sdk');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100_000;

describe('SNS infrastructure tests', () => {
    let container;

    beforeAll(async () => {
        container = await new GenericContainer('localstack/localstack')
        .withExposedPorts(4566)
        .withEnvironment('SERVICES', 'sqs,sns,events')
        .withEnvironment('DOCKER_HOST', 'unix:///var/run/docker.sock')
        .start();

        AWS.config.update({
            endpoint: config.endpoint,
            region: config.region,
        });
    });

    afterAll(async () => {
        if(container) {
            await container.stop();
        }
    });

    it('Create SNS topic', async () => {
        const topicName = 'my-test-topic';

        const { createSnsTopic } = require('../../src/infrastructure/sns.infra');

        const result = await createSnsTopic(topicName);

        expect(result).not.toBeUndefined();
    });

    it('Subscribe SNS topic', async () => {
        const topicName = 'my-test-topic';
        const queueName = 'my-test-queue';

        const { subscribeSnsTopicInQueue } = require('../../src/infrastructure/sns.infra');

        const result = await subscribeSnsTopicInQueue(topicName, queueName);

        expect(result).not.toBeUndefined();
    });
})