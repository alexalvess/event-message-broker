const config = require('../../src/config.json');
const { GenericContainer } = require('testcontainers');
const AWS = require('aws-sdk');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100_000;

describe('SQS infrastructure tests', () => {
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

    it('Create SQS queue', async () => {
        const queueName = 'my-test-queue';

        const { createQueue } = require('../../src/infrastructure/sqs.infra');

        const result = await createQueue(queueName);

        expect(result).toHaveSize(2);
    })
})