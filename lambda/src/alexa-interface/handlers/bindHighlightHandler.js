const {
    services,
    constants,
    controller,
    helperFunctions,
    cloudWatchLogger,
    universalAnalytics
} = require('./requiredPackages');


// It loads the highlight data in the playlist.
async function bindHighlightHandler(handlerInput) {
    try {
        const visitor = universalAnalytics(constants.googleIdCode);
        const highlightData = await services.getHighlights();
        let message;
        let reprompt;

        if (highlightData && highlightData.getAllDataFromXMLRSS && highlightData.getAllDataFromXMLRSS.length) {
            helperFunctions.setPlaybackInfoAttributes(handlerInput, highlightData.getAllDataFromXMLRSS, 'highlight');
            cloudWatchLogger.log('LOG', {
                'event': 'Highlight handler',
                'data': highlightData.getAllDataFromXMLRSS
            });
            return controller.play(handlerInput);
        } else {
            cloudWatchLogger.log('LOG', {
                'event': 'Highlight handler',
                'data': []
            });
            message = constants.literals.HighlightsHandler.EmptyListSpeakText;
            reprompt = constants.literals.HighlightsHandler.EmptyListListenText;
        }

        visitor.event('HighlightHandler', {
            'message': 'Looking for highlight'
        }).send();

        return handlerInput.responseBuilder
            .speak(message)
            .reprompt(reprompt)
            .getResponse();
    } catch (error) {
        cloudWatchLogger.log('ERROR', {
            'event': 'Highlight handler',
            'error': error
        });

        const visitor = universalAnalytics(constants.googleIdCode);
        visitor.event('HighlightHandler', {
            'message': 'Error occoured'
        }).send();

        return handlerInput.responseBuilder
            .speak(constants.literals.HighlightsHandler.PromiseErrorSpeakText)
            .addAudioPlayerStopDirective()
            .getResponse();
    }
}

module.exports = bindHighlightHandler;