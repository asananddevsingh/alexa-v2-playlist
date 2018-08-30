const moment = require('moment');
const constants = require('../constants/constants');
const dateFormatter = require('../utilities/timeZoneUtil');
const helperFunctions = require('../helper/helperFunctions');
const cloudWatchLogger = require('../utilities/cloudwatchLogger');

// Controller object having all playback controls such as, Play, Stop, etc.
const controller = {
  async play(handlerInput) {
    const {
      attributesManager,
      responseBuilder
    } = handlerInput;

    const playbackInfo = await helperFunctions.getPlaybackInfo(handlerInput);
    const {
      playList,
      playOrder,
      offsetInMilliseconds,
      index
    } = playbackInfo;

    const playBehavior = 'REPLACE_ALL';
    const podcast = playList[playOrder[index]];
    const token = playOrder[index];
    let audioSpeakText = '';
    let isEndOfThePlaylist = true;

    if (playbackInfo.playOrder && playbackInfo.playList) {
      isEndOfThePlaylist = playbackInfo.playOrder[playbackInfo.index] === playbackInfo.playList.length - 1;
    }

    if (podcast.published && moment(podcast.published).isValid() && !playbackInfo.hasResumeMode) {
      audioSpeakText = dateFormatter.formatPublishDate(podcast.published);
    }

    if (isEndOfThePlaylist) {
      audioSpeakText = podcast.title;
    }

    playbackInfo.hasResumeMode = false;

    responseBuilder
      .speak(audioSpeakText)
      .withShouldEndSession(true)
      .addAudioPlayerPlayDirective(playBehavior, podcast['audio'], token, offsetInMilliseconds, null);

    if (await helperFunctions.canThrowCard(handlerInput)) {
      let cardTitle = podcast.title;
      let cardContent = '';

      if (!isEndOfThePlaylist) {
        switch (playbackInfo.type) {
          case 'topic':
            if (podcast.published && moment(podcast.published).isValid()) {
              if (podcast.description) {
                cardContent = `${helperFunctions.removeHTMLTags(podcast.description)} \n\u{00A0}\n`;
              } else if (podcast.flyTitle && podcast.flyTitle.toLowerCase() != 'null') { //Sometimes it is null in string format.
                cardContent = `${podcast.flyTitle} \n\u{00A0}\n`;
              }
              cardContent = `${cardContent}From the ${dateFormatter.formatCardDate(podcast.published)} edition`;
            }
            break;
          case 'highlight':
            cardContent = `${ (!!podcast.description) ? `${helperFunctions.removeHTMLTags(podcast.description)}` : '' }`;
            break;
          default:
            break;
        }
      } else {
        cardTitle = constants.endOfPlaylistObject.cardTitle;
        cardContent = constants.endOfPlaylistObject.cardContent;
      }

      responseBuilder.withStandardCard(cardTitle, cardContent, constants.cardImages.smallImageUrl, constants.cardImages.largeImageUrl);
    }
    cloudWatchLogger.log('INFO', {
      'event': 'play',
      'podcast': podcast
    });

    return responseBuilder.getResponse();
  },
  stop(handlerInput) {
    cloudWatchLogger.log('INFO', {
      'event': 'stop'
    });

    return handlerInput.responseBuilder
      .speak(constants.literals.ExitHandler.SpeakText)
      .addAudioPlayerStopDirective()
      .getResponse();
  },
  async playNext(handlerInput) {
    const {
      playbackInfo,
      playbackSetting,
    } = await handlerInput.attributesManager.getPersistentAttributes();

    const nextIndex = (playbackInfo.index + 1) % playbackInfo.playList.length;

    if (nextIndex === 0 && !playbackSetting.loop) {
      return handlerInput.responseBuilder
        .speak(constants.literals.Playback.PlayNext)
        .addAudioPlayerStopDirective()
        .getResponse();
    }

    playbackInfo.index = nextIndex;
    playbackInfo.offsetInMilliseconds = 0;
    playbackInfo.playbackIndexChanged = true;
    cloudWatchLogger.log('INFO', {
      'event': 'playNext'
    });

    return this.play(handlerInput);
  },
  async playPrevious(handlerInput) {
    const {
      playbackInfo,
      playbackSetting,
    } = await handlerInput.attributesManager.getPersistentAttributes();

    let previousIndex = playbackInfo.index - 1;

    if (previousIndex === -1) {
      if (playbackSetting.loop) {
        previousIndex += playbackInfo.playList.length;
      } else {
        return handlerInput.responseBuilder
          .speak(constants.literals.Playback.PlayPrevious)
          .addAudioPlayerStopDirective()
          .getResponse();
      }
    }

    playbackInfo.index = previousIndex;
    playbackInfo.offsetInMilliseconds = 0;
    playbackInfo.playbackIndexChanged = true;
    cloudWatchLogger.log('INFO', {
      'event': 'playPrevious'
    });

    return this.play(handlerInput);
  },
  async dontResume(handlerInput) {
    const newPlaybackInfo = await helperFunctions.resetPlaybakInfoAttributes(handlerInput);
    cloudWatchLogger.log('LOG', {
      'event': 'dontResume',
      'msg': 'Playback info is reset',
      'data': newPlaybackInfo
    });

    return handlerInput.responseBuilder
      .speak(constants.literals.NoHandler.SpeakText)
      .reprompt(constants.literals.NoHandler.ListenText)
      .getResponse();
  }
};

module.exports = controller;