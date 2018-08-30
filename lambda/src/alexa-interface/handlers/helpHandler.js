const {
    constants,
    helperFunctions,
    cloudWatchLogger
} = require('./requiredPackages');

// Help handler => It is used to guide the user with the avilable options in the skill.
const HelpHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    async handle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        let message;
        let reprompt;

        if (!playbackInfo.hasPreviousPlaybackSession) {
            message = constants.literals.HelpHandler.SpeakText;
            reprompt = constants.literals.HelpHandler.ListenText;
            cloudWatchLogger.log('INFO', {
                'event': 'Help handler',
                'info': 'Asked for help when there is no any previous session.'
            });
        } else if (!playbackInfo.inPlaybackSession) {
            message = constants.literals.HelpHandler.ResumeStateSpeakText.replace('{0}', playbackInfo.playList[playbackInfo.index].title);
            reprompt = constants.literals.HelpHandler.ResumeStateListenText;
            cloudWatchLogger.log('INFO', {
                'event': 'Help handler',
                'info': 'Asked for help when there is an active session.'
            });
        } else {
            message = constants.literals.HelpHandler.HelpSpeakText;
            reprompt = constants.literals.HelpHandler.HelpListenText;
            cloudWatchLogger.log('INFO', {
                'event': 'Help handler',
                'info': 'Asked for help.'
            });
        }

        return handlerInput.responseBuilder
            .speak(message)
            .reprompt(reprompt)
            .getResponse();
    },
};

module.exports = HelpHandler;