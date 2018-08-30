const {
    constants,
    cloudWatchLogger
} = require('./requiredPackages');

// Error handler => It gets fired in the case of any unhandled exception or error.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        cloudWatchLogger.log('ERROR', {
            'event': 'Error handler',
            'error': error,
            'handlerInput': handlerInput
        });

        return handlerInput.responseBuilder
            .speak(constants.literals.ErrorHandler.SpeakText)            
            .addAudioPlayerStopDirective()
            .getResponse();
    },
};

module.exports = ErrorHandler;