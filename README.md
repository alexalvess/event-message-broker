# Message Bus SDK for AWS Resources

[![NPM version](https://img.shields.io/npm/v/aws-message-bus-package.svg)](https://www.npmjs.com/package/aws-message-bus-package)

## Table of Contents
* [Getting Started](#getting-Started)

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
const messageBus = require('aws-message-bus-package');

async () => await messageBus.infra.createQueue('your-queue-name');
async () => await messageBus.infra.createTopic('your-topic-name');
async () => await messageBus.infra.bindTopic('your-topic-name', 'your-queue-name');
```