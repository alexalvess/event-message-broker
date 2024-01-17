const { SQS } = require('aws-sdk');
const config = require('../config.json');
const { logInformation, logError } = require('../utils/log');

const sqs = new SQS();

async function createQueue(queueName) {
  try {
    const tags = config.tags.reduce((accumulator, current) => {
      accumulator[current.Key] = current.Value;
      return accumulator;
    }, {});

    const queue = await sqs.createQueue({ QueueName: queueName, tags: tags }).promise();
    const dlq = await sqs.createQueue({ QueueName: queueName + '-dlq', tags: tags }).promise();
    logInformation('Queues created:', [queue.QueueUrl, dlq.QueueUrl]);

    return [queue.QueueUrl, dlq.QueueUrl];
  } catch (error) {
    logError('Error to create queue:', error.message);
  }
}

module.exports = { createQueue }