const bindHighlightHandler = require('./bindHighlightHandler');
const {    
    controller,
    helperFunctions,
    cloudWatchLogger
  } = require('./requiredPackages');  

// Yes handler => It takes the YES command by the user and takes decision on when to resume audio and when to play highlights.
const YesHandler = {
    async canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.YesIntent';
    },
    async handle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);

        if (!playbackInfo.isPlayDefaultHighlight) {
            cloudWatchLogger.log('INFO', {
                'event':'Yes handler',
                'info': 'Resume the last session.'
            });
            return controller.play(handlerInput);
        } else {
            cloudWatchLogger.log('INFO', {
                'event':'Yes handler',
                'info': 'Play highlights by default.'
            });
            return bindHighlightHandler(handlerInput);
        }
    },
};

module.exports = YesHandler;