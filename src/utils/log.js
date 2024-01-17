const config = require('../config.json');

function logInformation(message, params) {
    log('\x1b[36m%s\x1b[0m', message, params);
}

function logWarning(message, params) {
    log('\x1b[33m%s\x1b[0m', message, params);
}

function logError(message, params) {
    log('\x1b[31m%s\x1b[0m', message, params);
}

function log(color, message, params) {
    if(!config.testMode) {
        console.log(color, message, params);
    }
}

module.exports = {
    logInformation,
    logWarning,
    logError
}