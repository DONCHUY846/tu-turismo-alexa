import * as Alexa from 'ask-sdk-core';
import { USER_GREETING_RESPONSE } from '../utils/constants.js';

export const UserGreetingIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'UserGreetingIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(USER_GREETING_RESPONSE)
            .reprompt(USER_GREETING_RESPONSE)
            .getResponse();
    }
};
