const {
    constants,
    helperFunctions,
    cloudWatchLogger
} = require('./requiredPackages');

// Exit handler => It stops the audio directive and kills the current session.
const ExitHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' &&
            (request.intent.name === 'AMAZON.StopIntent' ||
                request.intent.name === 'AMAZON.CancelIntent');
    },
    handle(handlerInput) {
        cloudWatchLogger.log('INFO', {
            'event': 'Exit handler',
            'msg': 'Stoping the player.'
        });

        return handlerInput.responseBuilder
            .speak(constants.literals.ExitHandler.SpeakText)
            .addAudioPlayerStopDirective()
            .getResponse();
    },
};

module.exports = ExitHandler;