const {
    GraphQLClient
} = require('graphql-request');
const constants = require('../constants/constants');
const cloudWatchLogger = require('../utilities/cloudwatchLogger');

// Consume the GraphQL endpoint and serve the data to the Alexa skill.
class GraphQLService {
    constructor(graphqlEndpointUrl) {
        this.graphQLClient = new GraphQLClient(graphqlEndpointUrl, {
            "headers": {
                'Content-Type': 'application/json',
                'x-api-key': constants.xAPIKey,
            },
        })
    };
    // Serve data to "Search topic" intent of the Alexa skill.
    async getSearchByTopics(topic) {
        try {
            if (topic) {
                const query = `{ getDataByTopics(size:${constants.serviceConfig.desiredTopicSize}, topic:"${topic}"){ id tegID title audio published description flyTitle} }`;
                const response = await this.graphQLClient.request(query);
                if (response && response.getDataByTopics && response.getDataByTopics.length) {
                    const endItem = new EndOfThePlaylistAudio(response.getDataByTopics.length + 1);
                    response.getDataByTopics.push(endItem);
                }
                return response;
            } else {
                cloudWatchLogger.log('ERROR', {
                    'event': 'Get search by topic',
                    'error': 'Topic not passed to the GraphQL service.'
                });
                throw new Error('Topic not passed to the GraphQL service.');
            }
        } catch (error) {
            cloudWatchLogger.log('ERROR', {
                'event': 'Get search by topic',
                'error': error
            });
            throw new Error(error);
        }
    };
    // Serve data to "Highlight" intent of the Alexa skill.
    async getHighlights() {
        try {
            const query = `{ getAllDataFromXMLRSS(size:${constants.serviceConfig.desiredHighlightSize}){ id title audio published description } }`;
            const response = await this.graphQLClient.request(query);
            if (response && response.getAllDataFromXMLRSS && response.getAllDataFromXMLRSS.length) {
                const endItem = new EndOfThePlaylistAudio(response.getAllDataFromXMLRSS.length + 1);
                response.getAllDataFromXMLRSS.push(endItem);
            }
            return response;
        } catch (error) {
            cloudWatchLogger.log('ERROR', {
                'event': 'Get highlights',
                'error': error
            });
            throw new Error(error);
        }
    };
}

// Construct the end of the playlist audio object.
class EndOfThePlaylistAudio {
    constructor(id) {
        if (id) {
            this['id'] = id;
            this['title'] = constants.endOfPlaylistObject.title;
            this['audio'] = constants.endOfPlaylistObject.url;
        }
    }
}

// Capture the unhandled promise rejections.
process.on('unhandledRejection', (reason, promise) => {
    cloudWatchLogger.log('ERROR', {
        'event': 'Service unhandled rejection',
        'promise': promise,
        'error': reason
    });
});

// Export the GraphQL service object.
module.exports = new GraphQLService(constants.graphQlUrl.rss);

// var service = new GraphQLService(constants.graphQlUrl.rss);
// service.getHighlights();
// service.getSearchByTopics('China');