export const QUEUE_URL_TEMPLATE = (
    endpoint: string
) => `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_ACCOUNT}/${endpoint}`;

export const TOPIC_ARN_TEMPLATE = (
    endpoint: string
) => `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:${endpoint}`;

export const QUEUE_ARN_TEMPLATE = (
    endpoint: string
) => `arn:aws:sqs:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT}:${endpoint}`;