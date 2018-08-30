const {
  cloudWatchLogger
} = require('./requiredPackages');

// Check audio interface handler => Check the skill supports the device or not.
const CheckAudioInterfaceHandler = {
  async canHandle(handlerInput) {
    const audioPlayerInterface = ((((handlerInput.requestEnvelope.context || {}).System || {}).device || {}).supportedInterfaces || {}).AudioPlayer;
    return audioPlayerInterface === undefined
  },
  handle(handlerInput) {
    cloudWatchLogger.log('ERROR', {
      'event': 'Check audio interface handler',
      'error': 'Skill is not supported on the device.'
    });

    return handlerInput.responseBuilder
      .speak('Sorry, this skill is not supported on this device')
      .withShouldEndSession(true)
      .getResponse();
  },
};

module.exports = CheckAudioInterfaceHandler;