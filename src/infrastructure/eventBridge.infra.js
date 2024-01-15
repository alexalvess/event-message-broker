const aws = require('aws-sdk');
const uuid = require('uuid');
const config = require('../config.json');

async function createRule(scheduleDate) {
    const id = uuid.v4();

    const subtractDates = Math.abs(scheduleDate - new Date());
    const scheduleMinutes = Math.floor((subtractDates/1000)/60);

    await eventBridge.putRule({
        Name: id,
        ScheduleExpression: `rate(${scheduleMinutes} minute${scheduleMinutes > 1 ? 's' : ''})`,
        State: 'ENABLED',
        Tags: config.tags
    }).promise();

    return id;
}

module.exports = { createRule }