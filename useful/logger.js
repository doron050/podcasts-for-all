const log4js = require('log4js');
const constants = require('./const');

log4js.configure({
    appenders: {
        console: {
            type: 'console'
        }
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'trace'
        }
    }
});

var logger = log4js.getLogger("default");

module.exports = logger;