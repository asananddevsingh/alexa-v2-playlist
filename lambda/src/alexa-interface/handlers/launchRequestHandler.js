const {
    constants,
    helperFunctions,
    cloudWatchLogger,
    universalAnalytics
} = require('./requiredPackages');

// Launch request hander => This is the entry point of the skill.
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput) {
        const visitor = universalAnalytics(constants.googleIdCode);
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        let message;
        let reprompt;
        let isEndOfThePlaylist = true;

        // Check, if the last playling audio is end of the playlist.
        if (playbackInfo.playOrder && playbackInfo.playList) {
            isEndOfThePlaylist = playbackInfo.playOrder[playbackInfo.index] === playbackInfo.playList.length - 1;
        }

        // Start new session, if there is no previous playback session or the last played audio was "End of the playlist".
        if (!playbackInfo.hasPreviousPlaybackSession || isEndOfThePlaylist) {
            message = constants.literals.LaunchRequestHandler.SpeakText;
            reprompt = constants.literals.LaunchRequestHandler.ListenText;
            playbackInfo.hasResumeMode = false;
            cloudWatchLogger.log('INFO', {
                'event': 'Launch request handler',
                'info': 'Starting skill with new session.'
            });
        } else { // Resume the last played audio.
            playbackInfo.inPlaybackSession = false;
            playbackInfo.isPlayDefaultHighlight = false;
            playbackInfo.hasResumeMode = true;
            const title = playbackInfo.playList[playbackInfo.playOrder[playbackInfo.index]].title;
            message = constants.literals.LaunchRequestHandler.ResumeStateSpeakText.replace('{0}', title);
            reprompt = constants.literals.LaunchRequestHandler.ResumeStateListenText;
            cloudWatchLogger.log('INFO', {
                'event': 'Launch request handler',
                'info': 'Skill having previous avilable.',
                'title': title
            });
        }

        visitor.event('LaunchRequestHandler', {
            'message':'Skill launched',
            'hasPreviousPlaybackSession': playbackInfo.hasPreviousPlaybackSession
        }).send();

        return handlerInput.responseBuilder
            .speak(message)
            .reprompt(reprompt)
            .getResponse();
    },
};

module.exports = LaunchRequestHandler;