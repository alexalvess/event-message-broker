const AWS = require('aws-sdk');
const config = require('./config.json');

describe('SNS infrastructure tests', () => {
    it('Should be create SNS topic', async () => {
        const topicName = 'test-topic';
        
        const createTopicSpy = jasmine.createSpyObj('AWS.SNS', ['createTopic']);
        createTopicSpy.createTopic.and.returnValue({
            promise: () => Promise.resolve({ TopicArn: `arn:aws:sns:eu-west-2:000000000000:${topicName}` })
        });
        
        spyOn(AWS, 'SNS').and.returnValue(createTopicSpy);

        const { createSnsTopic } = require('../src/infrastructure/sns.infra');

        const result = await createSnsTopic(topicName);

        expect(result).toBe(`arn:aws:sns:eu-west-2:000000000000:${topicName}`);
        expect(createTopicSpy.createTopic).toHaveBeenCalledWith({ Name: topicName });
    });
});