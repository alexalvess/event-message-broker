const aws = require('aws-sdk');
const config = require('./config.json');

aws.config.update({
    endpoint: config.endpoint,
    region: config.region,
});

const infra = require('./infrastructure/infra');
const service = require('./services/service');

module.exports = {
    infra,
    service
}