const config = require('../../../src/config.json');
const { GenericContainer, Wait } = require('testcontainers');
const AWS = require('aws-sdk');

let container;

async function configureContainer(services) {
    config.testMode = true;

    container = await new GenericContainer('localstack/localstack')
        .withExposedPorts(4566)
        .withEnvironment({ SERVICES: services })
        .withWaitStrategy(Wait.forLogMessage('Ready.'))
        .start();

    config.port = container.getMappedPort(4566);
    config.host = container.getHost();

    AWS.config.update({
        endpoint: `http://${config.host}:${config.port}`,
        region: config.region,
    });
}

async function stopContainer() {
    config.testMode = false;
    if(container) {
        await container.stop();
    }
}

module.exports = { configureContainer, stopContainer }