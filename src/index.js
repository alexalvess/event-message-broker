const aws = require('aws-sdk');
const config = require('./config.json');

aws.config.update({
    endpoint: config.endpoint,
    region: config.region,
});

const Infrastructure = require('./infrastructure/infra');
const Service = require('./services/service');

module.exports = {
    Infrastructure,
    Service
}