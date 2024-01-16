const config = require('../../../src/config.json');
const { GenericContainer, Wait } = require('testcontainers');
const AWS = require('aws-sdk');

let container;

async function configureContainer(services) {
    container = await new GenericContainer('localstack/localstack')
        .withExposedPorts(4566)
        .withEnvironment({ SERVICES: services })
        .withWaitStrategy(Wait.forLogMessage('Ready.'))
        .start();

    AWS.config.update({
        endpoint: `http://${container.getHost()}:${container.getMappedPort(4566)}`,
        region: config.region,
    });
}

async function stopContainer() {
    if(container) {
        await container.stop();
    }
}

module.exports = { configureContainer, stopContainer }