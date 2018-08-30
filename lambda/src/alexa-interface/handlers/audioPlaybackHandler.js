const {
    controller,
    helperFunctions,
    cloudWatchLogger
} = require('./requiredPackages');


// Start playback handler => It starts the audio player.
const StartPlaybackHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        if (!playbackInfo.inPlaybackSession) {
            return request.type === 'IntentRequest' && request.intent.name === 'PlayAudio';
        }
        if (request.type === 'PlaybackController.PlayCommandIssued') {
            return true;
        }

        if (request.type === 'IntentRequest') {
            return request.intent.name === 'PlayAudio' ||
                request.intent.name === 'AMAZON.ResumeIntent';
        }
    },
    handle(handlerInput) {
        return controller.play(handlerInput);
    },
};

// Next playback handler => It triggers the next audio in the playlist.
const NextPlaybackHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return playbackInfo.inPlaybackSession &&
            (request.type === 'PlaybackController.NextCommandIssued' ||
                (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NextIntent'));
    },
    handle(handlerInput) {
        return controller.playNext(handlerInput);
    },
};

// Previous playback handler => It triggers the previous audio in the playlist.
const PreviousPlaybackHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return playbackInfo.inPlaybackSession &&
            (request.type === 'PlaybackController.PreviousCommandIssued' ||
                (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PreviousIntent'));
    },
    handle(handlerInput) {
        return controller.playPrevious(handlerInput);
    },
};

// Previous playback handler => It pauses the currently playling audio.
const PausePlaybackHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return playbackInfo.inPlaybackSession &&
            request.type === 'IntentRequest' &&
            (request.intent.name === 'AMAZON.StopIntent' ||
                request.intent.name === 'AMAZON.CancelIntent' ||
                request.intent.name === 'AMAZON.PauseIntent');
    },
    handle(handlerInput) {
        return controller.stop(handlerInput);
    },
};

// Loon ON handler => It turns ON the looping of the playlist.
const LoopOnHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return playbackInfo.inPlaybackSession &&
            request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.LoopOnIntent';
    },
    async handle(handlerInput) {
        const playbackSetting = await handlerInput.attributesManager.getPersistentAttributes().playbackSettings;

        playbackSetting.loop = true;
        cloudWatchLogger.log('INFO', {
            'event': 'Loop on handler',
            'info': 'Loop turned on.'
        });

        return handlerInput.responseBuilder
            .speak('Loop turned on.')
            .getResponse();
    },
};

// Loon OFF handler => It turns OFF the looping of the playlist.
const LoopOffHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return playbackInfo.inPlaybackSession &&
            request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.LoopOffIntent';
    },
    async handle(handlerInput) {
        const playbackSetting = await handlerInput.attributesManager.getPersistentAttributes().playbackSetting;

        playbackSetting.loop = false;
        cloudWatchLogger.log('INFO', {
            'event': 'Loop off handler',
            'info': 'Loop turned off.'
        });

        return handlerInput.responseBuilder
            .speak('Loop turned off.')
            .getResponse();
    },
};

// Shuffle ON handler => It turns ON the shuffling of the playlist.
const ShuffleOnHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return playbackInfo.inPlaybackSession &&
            request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.ShuffleOnIntent';
    },
    async handle(handlerInput) {
        const {
            playbackInfo,
            playbackSetting,
        } = await handlerInput.attributesManager.getPersistentAttributes();

        playbackSetting.shuffle = true;
        playbackInfo.playOrder = await helperFunctions.shuffleOrder();
        playbackInfo.index = 0;
        playbackInfo.offsetInMilliseconds = 0;
        playbackInfo.playbackIndexChanged = true;
        cloudWatchLogger.log('INFO', {
            'event': 'Shuffle on handler',
            'info': 'Shuffle turned on.'
        });
        return controller.play(handlerInput);
    },
};

// Shuffle OFF handler => It turns OFF the shuffling of the playlist.
const ShuffleOffHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return playbackInfo.inPlaybackSession &&
            request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.ShuffleOffIntent';
    },
    async handle(handlerInput) {
        const {
            playbackInfo,
            playbackSetting,
        } = await handlerInput.attributesManager.getPersistentAttributes();

        if (playbackSetting.shuffle) {
            playbackSetting.shuffle = false;
            playbackInfo.index = playbackInfo.playOrder[playbackInfo.index];
            playbackInfo.playOrder = [...Array(playbackInfo.playList.length).keys()];
        }
        cloudWatchLogger.log('INFO', {
            'event': 'Shuffle off handler',
            'info': 'Shuffle turned off.'
        });
        return controller.play(handlerInput);
    },
};

// Start over handler => It starts over the currently playing audio.
const StartOverHandler = {
    async canHandle(handlerInput) {
        const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
        const request = handlerInput.requestEnvelope.request;

        return playbackInfo.inPlaybackSession &&
            request.type === 'IntentRequest' &&
            request.intent.name === 'AMAZON.StartOverIntent';
    },
    async handle(handlerInput) {
        const playbackInfo = await handlerInput.attributesManager.getPersistentAttributes().playbackInfo;

        playbackInfo.offsetInMilliseconds = 0;
        cloudWatchLogger.log('INFO', {
            'event': 'Start over handler',
            'info': 'Audio started over.'
        });

        return controller.play(handlerInput);
    },
};

module.exports = {
    StartPlaybackHandler,
    NextPlaybackHandler,
    PreviousPlaybackHandler,
    PausePlaybackHandler,
    LoopOnHandler,
    LoopOffHandler,
    ShuffleOnHandler,
    ShuffleOffHandler,
    StartOverHandler
};