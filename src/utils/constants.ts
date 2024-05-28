export const QUEUE_URL_TEMPLATE = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_ACCOUNT}/[queueName]`;
export const TOPIC_ARN_TEMPLATE = `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:[topicName]`;
export const QUEUE_ARN_TEMPLATE = `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:[queueName]`;