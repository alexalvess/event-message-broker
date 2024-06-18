import dotenv from 'dotenv';
dotenv.config();

import { GenericContainer, Wait } from 'testcontainers';
import { MessageBus } from '../../../src';

let container: any;

beforeAll(async () => {
    if(process.env.ENVIRONMENT_TEST !== 'containers') {
        return;
    }

    if(process.env.PROVIDER_TEST === 'aws') {
        container = await new GenericContainer('localstack/localstack')
            .withExposedPorts(4566)
            .withEnvironment({ SERVICES: 'sqs,sns' })
            .withWaitStrategy(Wait.forLogMessage('Ready.'))
            .start();

        MessageBus.useAws();
    } else if(process.env.PROVIDER_TEST === 'rabbitmq') {        
        container = await new GenericContainer('rabbitmq:3-management')
            .withExposedPorts(5672, 15672)
            .withEnvironment({ RABBITMQ_DEFAULT_USER: 'guest' })
            .withEnvironment({ RABBITMQ_DEFAULT_PASS: 'guest' })
            .withEnvironment({ RABBITMQ_PLUGINS: 'rabbitmq_management rabbitmq_delayed_message_exchange rabbitmq_defer' })
            .withWaitStrategy(Wait.forLogMessage('Ready.'))
            .start();

        MessageBus.useRabbitMq();
    }
});

afterAll(async () => {
    if(container) {
        await container.stop();
    }
});