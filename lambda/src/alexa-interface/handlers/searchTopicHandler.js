const {
  services,
  constants,
  controller,
  helperFunctions,
  cloudWatchLogger,
  universalAnalytics
} = require('./requiredPackages');

// Search topic handler => Which allows the user to search for any topic and listen to the playlist.
const SearchTopicHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'SearchTopic';
  },
  async handle(handlerInput) {
    try {
      const visitor = universalAnalytics(constants.googleIdCode);
      const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
      const slotValue = helperFunctions.getSearchTopicSlotValue(handlerInput);
      let message;
      let reprompt;
      cloudWatchLogger.log('LOG', {
        'event': 'Search topic handler',
        'topic': slotValue
      });

      if (slotValue) {
        const searchTopicData = await services.getSearchByTopics(slotValue);

        if (searchTopicData && searchTopicData.getDataByTopics && searchTopicData.getDataByTopics.length) {
          helperFunctions.setPlaybackInfoAttributes(handlerInput, searchTopicData.getDataByTopics, 'topic', slotValue);
          playbackInfo.isPlayDefaultHighlight = false;
          cloudWatchLogger.log('LOG', {
            'event': 'Search topic handler',
            'topic': slotValue,
            'data': searchTopicData
          });
          return controller.play(handlerInput);
        } else {
          playbackInfo.isPlayDefaultHighlight = true;
          message = constants.literals.SearchTopicHandler.EmptyListSpeakText;
          reprompt = constants.literals.SearchTopicHandler.EmptyListListenText;
        }
      } else {
        message = constants.literals.SearchTopicHandler.EmptySlotValueSpeakText;
        reprompt = constants.literals.SearchTopicHandler.EmptySlotValueListenText;
      }

      cloudWatchLogger.log('LOG', {
        'event': 'Search topic handler',
        'topic': slotValue,
        'data': []
      });
      
      visitor.event('SearchTopicHandler', {
        'message': 'Searched for a topic'
      }).send();

      return handlerInput.responseBuilder
        .speak(message)
        .reprompt(reprompt)
        .getResponse();

    } catch (error) {
      cloudWatchLogger.log('ERROR', {
        'event': 'Search topic handler',
        'error': error
      });

      const visitor = universalAnalytics(constants.googleIdCode);
      visitor.event('SearchTopicHandler', {
        'message': 'Error occoured'
      }).send();

      return handlerInput.responseBuilder
        .speak(constants.literals.SearchTopicHandler.PromiseErrorSpeakText)
        .addAudioPlayerStopDirective()
        .getResponse();
    }
  },
};

module.exports = SearchTopicHandler;