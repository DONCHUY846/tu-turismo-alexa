import * as Alexa from 'ask-sdk-core';
import { USER_GREETING_RESPONSE } from '../utils/constants.js';

export const UserGreetingIntentHandler = {
    canHandle(handlerInput) {
        if (Alexa.getRequestType(handlerInput.requestEnvelope) !== 'IntentRequest') return false;
        if (Alexa.getIntentName(handlerInput.requestEnvelope) !== 'UserGreetingIntent') return false;
        const attrs = handlerInput.attributesManager.getSessionAttributes();
        if (attrs.pendingAction) return false;
        return true;
    },
    handle(handlerInput) {
        const attrs = handlerInput.attributesManager.getSessionAttributes();
        if (attrs.ultimosItems && attrs.ultimosItems.length > 0) {
            const speechOutput = 'Para guardar en favoritos, di el primero, el segundo o el tercero del resultado que te gustó.';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt(speechOutput)
                .getResponse();
        }
        return handlerInput.responseBuilder
            .speak(USER_GREETING_RESPONSE)
            .reprompt(USER_GREETING_RESPONSE)
            .getResponse();
    }
};
