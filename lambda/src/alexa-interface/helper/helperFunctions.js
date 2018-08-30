const cloudWatchLogger = require('../utilities/cloudwatchLogger');

/* HELPER FUNCTIONS */

// This function is used to get the information associated with the playback.
async function getPlaybackInfo(handlerInput) {
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    return attributes.playbackInfo;
}

async function canThrowCard(handlerInput) {
    const {
        requestEnvelope,
        attributesManager
    } = handlerInput;
    const playbackInfo = await getPlaybackInfo(handlerInput);

    if (requestEnvelope.request.type === 'IntentRequest' && playbackInfo.playbackIndexChanged) {
        playbackInfo.playbackIndexChanged = false;
        return true;
    }
    return false;
}

// Set playback attributes, It saves the attributes in the dynamodb table.
async function setPlaybackInfoAttributes(handlerInput, playListData, type, topic) {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    playbackInfo.type = type;
    playbackInfo.playList = playListData;
    playbackInfo.playOrder = [...Array(playbackInfo.playList.length).keys()];
    playbackInfo.index = 0;
    playbackInfo.offsetInMilliseconds = 0;
    playbackInfo.playbackIndexChanged = true;
    playbackInfo.hasPreviousPlaybackSession = false;
    if (type === 'topic') {
        playbackInfo.topic = topic;
    } else {
        (!!playbackInfo.topic) ? delete playbackInfo.topic: '';
    }
};

// Extracting token received in the request.
function getToken(handlerInput) {
    return handlerInput.requestEnvelope.request.token;
}

// Extracting index from the token received in the request.
async function getIndex(handlerInput) {
    const tokenValue = parseInt(handlerInput.requestEnvelope.request.token, 10);
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();

    return attributes.playbackInfo.playOrder.indexOf(tokenValue);
}

// Extracting offsetInMilliseconds received in the request.
function getOffsetInMilliseconds(handlerInput) {
    return handlerInput.requestEnvelope.request.offsetInMilliseconds;
}

// Using Fisher-Yates algo to shuffle the playlist.
async function shuffleOrder() {
    const playbackInfo = await getPlaybackInfo(handlerInput);
    const array = [...Array(playbackInfo.playList.length).keys()];
    let currentIndex = array.length;
    let temp;
    let randomIndex;
    // Algorithm : Fisher-Yates shuffle
    return new Promise((resolve) => {
        while (currentIndex >= 1) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temp = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temp;
        }
        resolve(array);
    });
}

// Get the value of custom slot "mySearchTopic" which holds the available topics.
function getSearchTopicSlotValue(handlerInput) {

    if (handlerInput) {

        // slotValue is the value of the slot without having any synonym.
        let slotValue = handlerInput.requestEnvelope.request.intent.slots.mySearchTopic.value;
        const resolutions = handlerInput.requestEnvelope.request.intent.slots.mySearchTopic.resolutions;

        if (resolutions) {
            const resolutionsPerAuthority = resolutions.resolutionsPerAuthority;
            if (resolutionsPerAuthority && resolutionsPerAuthority.length) {

                const status = resolutionsPerAuthority[0].status;
                if (status && status['code'] === 'ER_SUCCESS_MATCH') {
                    // If the synonym is available, It will return the slot value associated with that synonym.
                    slotValue = resolutionsPerAuthority[0].values[0].value.name;
                }
            }
        }
        return slotValue;
    } else {
        throw new Error('Invalid handler input to get the slot vaule of topics.');
    }
}

async function resetPlaybakInfoAttributes(handlerInput) {
    try {
        const playbackInfo = await getPlaybackInfo(handlerInput);

        playbackInfo.index = 0;
        playbackInfo.token = null;
        playbackInfo.playList = [];
        playbackInfo.playOrder = [];
        playbackInfo.hasResumeMode = false;
        playbackInfo.offsetInMilliseconds = 0;
        playbackInfo.inPlaybackSession = false;
        playbackInfo.nextStreamEnqueued = false;
        playbackInfo.playbackIndexChanged = false;
        playbackInfo.isPlayDefaultHighlight = false;
        playbackInfo.hasPreviousPlaybackSession = false;
        if (playbackInfo.type === 'topic') {
            delete playbackInfo.topic;
        }
        delete playbackInfo.type;

        return playbackInfo;
    } catch (error) {
        cloudWatchLogger.log('ERROR', {
            'event': 'resetPlaybakInfoAttributes in helper functions',
            'error': error,
            'msg': 'Failed to reset the playback info attributes.'
        });
        throw new Error('Failed to reset the playback info attributes.');
    }
}

function removeHTMLTags(strDescription) {
    try {
        if (strDescription) {
            const regex = /(<([^>]+)>)/ig;
            return strDescription.replace('<br>', '\n\u{00A0}\n').replace(regex, '');
        }
        return '';
    } catch (error) {
        cloudWatchLogger.log('ERROR', {
            'event': 'removeHTMLTags in helper functions',
            'error': error,
            'msg': 'Failed to remove the HTML lags from the description.'
        });
        throw new Error('Failed to remove the HTML lags from the description.');
    }
}

module.exports = {
    getPlaybackInfo,
    canThrowCard,
    getToken,
    getIndex,
    getOffsetInMilliseconds,
    shuffleOrder,
    setPlaybackInfoAttributes,
    getSearchTopicSlotValue,
    resetPlaybakInfoAttributes,
    removeHTMLTags
}