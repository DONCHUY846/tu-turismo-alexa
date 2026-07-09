import * as Alexa from 'ask-sdk-core';
import { HELP_RESPONSE } from '../utils/constants.js';

export const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(HELP_RESPONSE)
            .reprompt(HELP_RESPONSE)
            .getResponse();
    }
};
