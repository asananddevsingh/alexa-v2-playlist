const {
    cloudWatchLogger
} = require('./requiredPackages');

// Session end request handler => It ends the session with the reason. It gets fired specially when there is some syntactical error in the code.
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        cloudWatchLogger.log('ERROR', {
            'event': 'Session ended request handler',
            'error': handlerInput.requestEnvelope.request.reason
        });
        
        return handlerInput.responseBuilder.getResponse();
    },
};

module.exports = SessionEndedRequestHandler;