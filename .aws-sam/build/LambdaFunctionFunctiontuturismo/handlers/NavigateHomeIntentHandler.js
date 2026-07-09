import * as Alexa from 'ask-sdk-core';
import { NAVIGATE_HOME_RESPONSE } from '../utils/constants.js';

export const NavigateHomeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NavigateHomeIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(NAVIGATE_HOME_RESPONSE)
            .getResponse();
    }
};
