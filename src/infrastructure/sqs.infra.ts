import { SQS } from 'aws-sdk';
import config from '../config.json';
import { logInformation, logError } from '../utils/log';

const sqs = new SQS();

export async function createQueue(queueName: string) {
  try {
    const tags = config.tags.reduce((accumulator: any, current: any) => {
      accumulator[current.Key] = current.Value;
      return accumulator;
    }, {});

    const queue = await sqs.createQueue({ QueueName: queueName, tags: tags }).promise();
    const dlq = await sqs.createQueue({ QueueName: queueName + '-dlq', tags: tags }).promise();
    logInformation('Queues created:', [queue.QueueUrl, dlq.QueueUrl]);

    return [queue.QueueUrl, dlq.QueueUrl];
  } catch (error: any) {
    logError('Error to create queue:', error.message);
    throw error;
  }
}