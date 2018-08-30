const {
    cloudWatchLogger
} = require('./requiredPackages');

// System exception handler => It alerts the user in the case of any system exceptions.
const SystemExceptionHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
    },
    handle(handlerInput) {
        cloudWatchLogger.log('ERROR', {
            'event': 'System exception handler',
            'error': handlerInput.requestEnvelope.request.reason
        });
                
        return handlerInput.responseBuilder.getResponse();
    },
};

module.exports = SystemExceptionHandler;