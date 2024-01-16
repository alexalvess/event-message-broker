const { configureContainer, stopContainer } = require('../bootstrap/aws.service.config');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100_000;

describe('EventBridge service tests', () => {
    beforeAll(async () => await configureContainer('events'));
    afterAll(async () => await stopContainer());

    it('Schedule Message', async () => {
        const topicName = 'my-test-topic';
        const message = { message: 'test' }
        const scheduleDate = new Date(new Date().getTime() + 60 * 1000);

        const { scheduleMessage } = require('../../../src/services/eventBridge.service');

        const result = await scheduleMessage(topicName, message, scheduleDate);

        expect(result).not.toBeUndefined();
        expect(result.id).not.toBeUndefined();
        expect(result.ruleArn).not.toBeUndefined();
        expect(result.targets).not.toBeUndefined();
        expect(result.events).not.toBeUndefined();
    })
})