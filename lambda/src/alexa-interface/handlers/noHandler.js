const {
    controller,
    helperFunctions,
    cloudWatchLogger
} = require('./requiredPackages');

// NO handler => It takes the NO command by the user and starts with a new session.
const NoHandler = {
    async canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NoIntent';
    },
    async handle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        playbackInfo.hasResumeMode = false;
        cloudWatchLogger.log('INFO', {
            'event':'No handler',
            'info': 'Do not resume last session'
        });
        return controller.dontResume(handlerInput);
    },
};

module.exports = NoHandler;