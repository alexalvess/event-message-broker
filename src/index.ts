import aws from 'aws-sdk';
import config from './config.json';

export * as Infrastructure from './infrastructure/infra';
export * as Service from './services/service';

aws.config.update({
    account: {
        endpoint: `http://${config.host}:${config.port}`
    },
    region: config.region,
});