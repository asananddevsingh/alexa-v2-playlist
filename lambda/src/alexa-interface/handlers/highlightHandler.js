const bindHighlightHandler = require('./bindHighlightHandler');
const {
    helperFunctions    
} = require('./requiredPackages');

// Highlight handler => Which allows the user to listen to the highlights.
const HighlightHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'Highlight';
    },
    async handle(handlerInput) {
        return bindHighlightHandler(handlerInput);
    },
};

module.exports = HighlightHandler;