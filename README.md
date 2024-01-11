# Message Bus SDK for AWS Resources

[![NPM version](https://img.shields.io/npm/v/aws-message-bus-package.svg)](https://www.npmjs.com/package/aws-message-bus-package)

## Table of Contents
* [Getting Started](#getting-Started)
* [API](#api)

## Getting Started

**1. Install**

```shell
npm install aws-message-bus-package
```

**2. Config File**

You need to create a config.json file in your root/src project and input some AWS informations, like bellow:

```json
{
    "endpoint": "http://localhost:4566",
    "region": "eu-west-2",
    "snsArnPrefix": "arn:aws:sns:eu-west-2:000000000000",
    "sqsArnPrefix": "arn:aws:sqs:eu-west-2:000000000000",
    "queuUrlPrefix": "http://sqs.eu-west-2.localhost.localstack.cloud:4566/000000000000"
}
```

**3. Sample Usage**

```javascript
const { Infrastructure } = require('aws-message-bus-package');

async () => await Infrastructure.createQueue('your-queue-name');
async () => await Infrastructure.createTopic('your-topic-name');
async () => await Infrastructure.bindTopic('your-topic-name', 'your-queue-name');
```

## API

### `Infrastructure.createQueue('queue-name')`
Create a new SQS queue

### `Infrastructure.bindTopic('topic-name', 'queue-name')`
* Create a new SNS topic, if not exists
* Subscribe a SNS topic in a SQS queue

### `Service.publishMessage('topic-name', {CONTENT})`
Send a message to SNS topic to do broadcast
* Content: any kind of type/object, this will be transformed into a JSON format

### `Service.sendMessage('queue-name', {CONTENT}, {PARAMS})`
Send a message to SQS queue direct

* Content: any kind of type/object, this will be transformed into a JSON format
* Params: [SQS.Types.SendMessageRequest](https://github.com/aws/aws-sdk-js/blob/7bcd9ab0d0b623ac99730a051a9758068910e9b3/clients/sqs.d.ts#L751)
    * **You don't need to inform:**
        * MessageBody
        * MessageAttributes
        * QueueUrl

### `Service.scheduleMessage('topic-name', {CONTENT}, [SCHEDULED_DATE])`
Send a message to EventBridge informing the SNS topic with the destination. This message will be consumed when it arrives on the scheduled date.

* Content: any kind of type/object, this will be transformed into a JSON format

### `Service.handleConsumerMessage('queue-name', {RESILIENCE_PARAMS})`
Handle a consumer to consume queue messages

* Resilience Params:
    * maxRetryCount: max number of attempts until send to DLQ
    * delaySeconds: the time that will wait between attempts