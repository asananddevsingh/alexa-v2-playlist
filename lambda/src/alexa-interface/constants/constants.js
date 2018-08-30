const dateFormatter = require('../utilities/timeZoneUtil');

/* CONSTANTS */

// Skill configurations.
const skillConfig = {
  appId: '',
  dynamoDBTableName: 'TheEconomist',
  debug: false
};

exports.skill = skillConfig;

// GraphQL service configurations.
exports.serviceConfig = {
  desiredTopicSize: 10,
  desiredHighlightSize: 2,
}

// Literals that has been used in the intetnts of the Alexa skill. These will 
exports.literals = Object.freeze({
  'LaunchRequestHandler': {
    'SpeakText': `${debugSkill('Launch request intent.')} ${dateFormatter.welcomeMsg()} To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`,
    'ListenText': `${debugSkill('Launch request intent.')} To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`,
    'ResumeStateSpeakText': `${debugSkill('Launch request intent.')} You were listening to {0}, Would you like to resume?`,
    'ResumeStateListenText': `${debugSkill('Launch request intent.')} Would you like to resume? Say no to start a new session.`
  },
  'SearchTopicHandler': {
    'EmptySlotValueSpeakText': `${debugSkill('Search topic intent. Empty Slot value.')} Sorry, I don't understand. Please say help to hear what you can ask for.`,
    'EmptySlotValueListenText': `${debugSkill('Search topic intent. Empty Slot value.')} Sorry, I don't understand. Please say help to hear what you can ask for.`,
    'PromiseErrorSpeakText': `${debugSkill('Search topic intent. Promise error.')} Sorry, something went wrong. Please try again later.`,
    'EmptyListSpeakText': `${debugSkill('Search topic intent. Empty data list.')} Sorry, that topic is unavailable. Would you like to listen to the highlights? If you'd like to search for another topic, say Alexa, ask The Economist for the latest and name the topic.`,
    'EmptyListListenText': `${debugSkill('Search topic intent. Empty data list.')} Would you like to listen to the highlights? If you'd like to search for another topic, say Alexa, ask The Economist for the latest and name the topic.`
  },
  'HighlightsHandler': {
    'PromiseErrorSpeakText': `${debugSkill('Highlights intent. Promise error.')} Sorry, something went wrong. Please try again later.`,
    'EmptyListSpeakText': `${debugSkill('Highlights intent. Empty data list.')} Sorry, the highlights are not available. Would you like to search by topic? You can say, Alexa, ask The Economist to get me the latest and name the topic.`,
    'EmptyListListenText': `${debugSkill('Highlights intent. Empty data list.')} Would you like to search by topic? You can say, Alexa, ask The Economist to get me the latest and name the topic.`
  },
  'HelpHandler': {
    'SpeakText': `${debugSkill('Help intent.')} To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`,
    'ListenText': `${debugSkill('Help intent.')} To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`,
    'ResumeStateSpeakText': `${debugSkill('Help intent.')} You were listening to {0}, Would you like to resume?`,
    'ResumeStateListenText': `${debugSkill('Help intent.')} Would you like to resume? Say no to start a new session.`,
    'HelpSpeakText': `${debugSkill('Help intent.')} You can say, Next or Previous to navigate through the playlist. At any time, you can say Pause to pause the audio and Resume to resume.`,
    'HelpListenText': `${debugSkill('Help intent.')} You can say, Next or Previous to navigate through the playlist. At any time, you can say Pause to pause the audio and Resume to resume.`,
  },
  'NoHandler': {
    'SpeakText': `${debugSkill('No intent.')} To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`,
    'ListenText': `${debugSkill('No intent.')} To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`
  },
  'ExitHandler': {
    'SpeakText': `${debugSkill('Stop audio intent.')} Good bye.`
  },
  'ErrorHandler': {
    'SpeakText': `${debugSkill('Error intent.')} Sorry, something went wrong. To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`,
    'ListenText': `${debugSkill('Error intent.')} To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`,
  },
  'Playback': {
    'PlayNext': `${debugSkill('Playback.')} You have reached the end of the playlist. To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`,
    'PlayPrevious': `${debugSkill('Playback.')} You have reached the start of the playlist. To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`
  }
});

// This fuction is used allow the device to call the intent names in the debug mode.
function debugSkill(intentName) {
  if (skillConfig.debug) {
    return `${intentName}.`;
  }
  return '';
}

// End fo the playlist audios.
exports.endOfPlaylistObject = {
  'title': `You have reached the end of the playlist. To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`,
  'url': `https://s3.amazonaws.com/alexa-economist-skill-audio/empty_audio.mp3`,
  'cardTitle': `End of Playlist`,
  'cardContent': `To get the latest on any topic, say Alexa, ask The Economist to get me the latest and name the topic. To hear this week's highlights, say Alexa, ask The Economist to start the highlights.`
}

// GraphQL URLs
exports.graphQlUrl = {
  'stage': 'https://stage.economist.com/graphql',
  'prod': 'https://www.economist.com/graphql',
  'rss': 'https://45ju5gk2lvf25l27mmk3l2t6u4.appsync-api.us-east-1.amazonaws.com/graphql'
}

// x-api-key that needs to be passed in the header of GraphQLService.
exports.xAPIKey = 'da2-m2vdinm2jrgy3lokla5wwg2f34';

exports.cloudwatchLogger = {
  'logGroupName': '/Alexa/TheEconomist',
  'region': 'us-east-1'
}

exports.cardImages = {
  smallImageUrl: 'https://image.ibb.co/cdwy8U/economist_logo_720x480_1.png',
  largeImageUrl: 'https://image.ibb.co/gegLNp/economist_logo_1200x800.png',  
}
exports.googleIdCode = 'UA-124191710-1';