const { configureContainer, stopContainer } = require('../bootstrap/aws.service.config');
const { SQS } = require('aws-sdk');
const config = require('../../../src/config.json')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100_000;

describe('SQS service tests', () => {
    beforeAll(async () => await configureContainer('sqs'));
    afterAll(async () => await stopContainer());

    it('Send to exist SQS queue', async () => {
        const queueName = 'myTestQueue';
        const message = { message: 'test' }

        const { createQueue } = require('../../../src/infrastructure/sqs.infra');
        // const { sendMessageQueue } = require('../../../src/services/sqs.service');

        const queues = await createQueue(queueName);

        const temp = await new SQS().sendMessage({
            QueueUrl: config.queuUrlPrefix.replace('[REGION]', config.region).replace('[PORT]', config.port),
            MessageBody: 'test'
        }).promise();

        console.log(temp);
        // await sendMessageQueue(queueName, message);

        expect(temp).not.toBeUndefined();
    });
})