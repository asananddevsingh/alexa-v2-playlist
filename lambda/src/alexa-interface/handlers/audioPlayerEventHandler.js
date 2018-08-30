const {
  helperFunctions,
  cloudWatchLogger
} = require('./requiredPackages');

// Audio player event handler => Which checks the multiple states of the 'AudioPlayer' directive.
const AudioPlayerEventHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type.startsWith('AudioPlayer.');
  },
  async handle(handlerInput) {
    const {
      requestEnvelope,
      attributesManager,
      responseBuilder
    } = handlerInput;
    const audioPlayerEventName = requestEnvelope.request.type.split('.')[1];
    const {
      playbackSetting,
      playbackInfo
    } = await attributesManager.getPersistentAttributes();

    switch (audioPlayerEventName) {
      case 'PlaybackStarted':
        playbackInfo.token = helperFunctions.getToken(handlerInput);
        playbackInfo.index = await helperFunctions.getIndex(handlerInput);
        playbackInfo.inPlaybackSession = true;
        playbackInfo.hasPreviousPlaybackSession = true;
        cloudWatchLogger.log('INFO', {
          'event': 'Playback started.'
        });
        break;
      case 'PlaybackFinished':
        playbackInfo.inPlaybackSession = false;
        playbackInfo.hasPreviousPlaybackSession = false;
        playbackInfo.nextStreamEnqueued = false;
        cloudWatchLogger.log('INFO', {
          'event': 'Playback finished.'
        });
        break;
      case 'PlaybackStopped':
        playbackInfo.token = helperFunctions.getToken(handlerInput);
        playbackInfo.index = await helperFunctions.getIndex(handlerInput);
        playbackInfo.offsetInMilliseconds = helperFunctions.getOffsetInMilliseconds(handlerInput);
        cloudWatchLogger.log('INFO', {
          'event': 'Playback stopped.'
        });
        break;
      case 'PlaybackNearlyFinished':
        {
          if (playbackInfo.nextStreamEnqueued) {
            break;
          }

          const enqueueIndex = (playbackInfo.index + 1) % playbackInfo.playList.length;

          if (enqueueIndex === 0 && !playbackSetting.loop) {
            break;
          }

          playbackInfo.nextStreamEnqueued = true;

          const enqueueToken = playbackInfo.playOrder[enqueueIndex];
          const playBehavior = 'ENQUEUE';
          const podcast = playbackInfo.playList[playbackInfo.playOrder[enqueueIndex]];
          const expectedPreviousToken = playbackInfo.token;
          const offsetInMilliseconds = 0;

          cloudWatchLogger.log('INFO', {
            'event': 'Playback nearly finished.',
            'enqueueToken': enqueueToken,
            'podcast': podcast
          });

          responseBuilder.addAudioPlayerPlayDirective(
            playBehavior,
            podcast['audio'],
            enqueueToken,
            offsetInMilliseconds,
            expectedPreviousToken,
          );
          break;
        }
      case 'PlaybackFailed':
        playbackInfo.inPlaybackSession = false;
        cloudWatchLogger.log('ERROR', {
          'event': 'Playback failed.',
          'error': handlerInput.requestEnvelope.request.error
        });
        return;
      default:
        cloudWatchLogger.log('ERROR', {
          'event': 'default.',
          'error': 'Should never reach here!'
        });
        throw new Error('Should never reach here!');
    }
    return responseBuilder.getResponse();
  },
};

module.exports = AudioPlayerEventHandler;