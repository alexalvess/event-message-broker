import config from '../config.json';

export function logInformation(message: string, params?: any) {
    log('\x1b[36m%s\x1b[0m', message, params);
}

export function logWarning(message: string, params?: any) {
    log('\x1b[33m%s\x1b[0m', message, params);
}

export function logError(message: string, params: any) {
    log('\x1b[31m%s\x1b[0m', message, params);
}

export function log(color: string, message: string, params?: any) {
    if(!config.testMode) {
        console.log(color, message, params);
    }
}