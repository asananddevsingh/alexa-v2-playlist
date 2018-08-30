const bunyan = require('bunyan');
const createCWStream = require('bunyan-cloudwatch');
const constObject = require('./const');

const cloudwatchLogger = constObject.cloudwatchLogger;

class CloudWatchLogger {
    constructor() {};
    
    log(streamName, logInfo) {
        try {
            
            const stream = createCWStream({
                logGroupName: cloudwatchLogger.logGroupName,
                logStreamName: streamName,
                cloudWatchLogsOptions: {
                    region: cloudwatchLogger.region
                }
            });

            const logger = bunyan.createLogger({
                name: streamName,
                streams: [{
                    stream: stream,
                    type: 'raw'
                }]
            });

            logger.fatal(logInfo);
        } catch (error) {
            console.log('Error in the cloud watch logger utility.');
            throw new Error('Error in the cloud watch logger utility.');
        }
    }
}

module.exports = new CloudWatchLogger();