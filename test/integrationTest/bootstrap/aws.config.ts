import dotenv from 'dotenv';
dotenv.config();

import { GenericContainer, Wait } from 'testcontainers';

let container: any;

beforeAll(async () => {
    if(process.env.ENVIRONMENT_TEST === 'aws') {
        return;
    }

    container = await new GenericContainer('localstack/localstack')
        .withExposedPorts(4566)
        .withEnvironment({ SERVICES: 'sqs,sns' })
        .withWaitStrategy(Wait.forLogMessage('Ready.'))
        .start();
});

afterAll(async () => {
    if(container) {
        await container.stop();
    }
});