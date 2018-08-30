const alexa = require('ask-sdk');
const constants = require('./constants/constants');
const LaunchRequestHandler = require('./handlers/launchRequestHandler');
const SearchTopicHandler = require('./handlers/searchTopicHandler');
const HighlightHandler = require('./handlers/highlightHandler');
const AudioPlayerEventHandler = require('./handlers/audioPlayerEventHandler');
const CheckAudioInterfaceHandler = require('./handlers/checkAudioInterfaceHandler');
const YesHandler = require('./handlers/yesHandler');
const NoHandler = require('./handlers/noHandler');
const HelpHandler = require('./handlers/helpHandler');
const ExitHandler = require('./handlers/exitHandler');
const SystemExceptionHandler = require('./handlers/systemExceptionHandler');
const SessionEndedRequestHandler = require('./handlers/sessionEndedRequestHandler');
const ErrorHandler = require('./handlers/errorHandler');
const {
  StartPlaybackHandler,
  NextPlaybackHandler,
  PreviousPlaybackHandler,
  PausePlaybackHandler,
  LoopOnHandler,
  LoopOffHandler,
  ShuffleOnHandler,
  ShuffleOffHandler,
  StartOverHandler
} = require('./handlers/audioPlaybackHandler');

/* INTERCEPTORS */
// Load the attributes associated with the skill.
const LoadPersistentAttributesRequestInterceptor = {
  async process(handlerInput) {
    const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();

    // Check if user is invoking the skill the first time and initialize preset values
    if (Object.keys(persistentAttributes).length === 0) {
      handlerInput.attributesManager.setPersistentAttributes({
        playbackSetting: {
          loop: false,
          shuffle: false,
        },
        playbackInfo: {
          index: 0,
          offsetInMilliseconds: 0,
          playbackIndexChanged: true,
          token: '',
          nextStreamEnqueued: false,
          inPlaybackSession: false,
          hasPreviousPlaybackSession: false
        },
      });
    }
  },
};

// Save the attributes associated with the skill.
const SavePersistentAttributesResponseInterceptor = {
  async process(handlerInput) {
    await handlerInput.attributesManager.savePersistentAttributes();
  },
};

// Register the handlers.
const skillBuilder = alexa.SkillBuilders.standard();
exports.handler = skillBuilder
  .addRequestHandlers(
    CheckAudioInterfaceHandler,
    LaunchRequestHandler,
    HelpHandler,
    SystemExceptionHandler,
    SessionEndedRequestHandler,
    YesHandler,
    NoHandler,
    StartPlaybackHandler,
    NextPlaybackHandler,
    PreviousPlaybackHandler,
    PausePlaybackHandler,
    LoopOnHandler,
    LoopOffHandler,
    ShuffleOnHandler,
    ShuffleOffHandler,
    StartOverHandler,
    ExitHandler,
    AudioPlayerEventHandler,
    SearchTopicHandler,
    HighlightHandler
  )
  .addRequestInterceptors(LoadPersistentAttributesRequestInterceptor)
  .addResponseInterceptors(SavePersistentAttributesResponseInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withAutoCreateTable(true)
  .withTableName(constants.skill.dynamoDBTableName)
  .lambda();