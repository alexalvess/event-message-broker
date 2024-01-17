const { SQS } = require('aws-sdk');
const config = require('../config.json');

const sqs = new SQS();

async function createQueue(queueName) {
  try {
    const queue = await sqs.createQueue({ QueueName: queueName }).promise();
    const dlq = await sqs.createQueue({ QueueName: queueName + '-dlq' }).promise();
    console.log('Queues created:', queue.QueueUrl, dlq.QueueUrl);

    return [queue.QueueUrl, dlq.QueueUrl];
  } catch (error) {
    console.error('Error to create queue:', error.message);
  }
}

module.exports = { createQueue }