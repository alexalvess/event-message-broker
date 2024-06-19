import dotenv from 'dotenv';
dotenv.config();

import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { MessageBus } from '../../../src';

let container: StartedTestContainer;

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
            .withEnvironment({ 
                RABBITMQ_DEFAULT_USER: process.env.RABBITMQ_USER ?? '',
                RABBITMQ_DEFAULT_PASS: process.env.RABBITMQ_PASS ?? '',
                RABBITMQ_PLUGINS: 'rabbitmq_management rabbitmq_delayed_message_exchange rabbitmq_defer'
            })
            .withWaitStrategy(Wait.forLogMessage('Ready.'))
            .start();

        process.env.RABBITMQ_HOST = container.getHost();
        process.env.RABBITMQ_PORT = container.getMappedPort(15672).toString();

        MessageBus.useRabbitMq();
    }
});

afterAll(async () => {
    if(container) {
        await container.stop();
    }
});