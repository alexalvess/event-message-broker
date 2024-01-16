const { configureContainer, stopContainer } = require('../bootstrap/aws.service.config');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100_000;

describe('EventBridge infrastructure tests', () => {
    beforeAll(async () => await configureContainer('events'));
    afterAll(async () => await stopContainer());

    it('Create EventBridge rule', async () => {
        const scheduleDate = new Date(new Date().getTime() + 60 * 1000);

        const { createRule } = require('../../../src/infrastructure/eventBridge.infra');

        const result = await createRule(scheduleDate);

        expect(result).not.toBeUndefined();
        expect(result.id).not.toBeUndefined();
        expect(result.ruleArn).not.toBeUndefined();
    })
})