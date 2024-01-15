const config = require('../src/config.json');
const AWS = require('aws-sdk');

let snsSpy;

describe('SNS infrastructure tests', () => {
    beforeAll(() => {
        snsSpy = jasmine.createSpyObj('AWS.SNS', ['createTopic', 'subscribe']);
        spyOn(AWS, 'SNS').and.returnValue(snsSpy);
    })

    it('Should be create SNS topic', async () => {
        const topicName = 'test-topic';

        snsSpy.createTopic.and.returnValue({
            promise: () => Promise.resolve({ TopicArn: `${config.snsArnPrefix}:${topicName}` })
        });

        const { createSnsTopic } = require('../src/infrastructure/sns.infra');

        const result = await createSnsTopic(topicName);

        expect(result).toBe(`${config.snsArnPrefix}:${topicName}`);
        expect(snsSpy.createTopic).toHaveBeenCalledWith({ Name: topicName });
    });

    it('Should be subscribe SNS topic into a Queue', async () => {
        const topicName = 'test-topic';
        const queueName = 'test-queue';

        snsSpy.subscribe.and.returnValue({
            promise: () => Promise.resolve({ SubscriptionArn: `${config.snsArnPrefix}:${topicName}:b6f5e924-dbb3-41c9-aa3b-589dbae0cfff` })
        });

        const { subscribeSnsTopicInQueue } = require('../src/infrastructure/sns.infra');

        const result = await subscribeSnsTopicInQueue(topicName, queueName);

        expect(result).toBe(`${config.snsArnPrefix}:${topicName}:b6f5e924-dbb3-41c9-aa3b-589dbae0cfff`);
        expect(snsSpy.subscribe).toHaveBeenCalledWith({
            Protocol: 'sqs',
            TopicArn: `${config.snsArnPrefix}:${topicName}`,
            Endpoint: `${config.sqsArnPrefix}:${queueName}`
        });
    });
});