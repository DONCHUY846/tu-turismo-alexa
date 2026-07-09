import * as Alexa from 'ask-sdk-core';
import { CANCEL_STOP_RESPONSE } from '../utils/constants.js';

export const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(CANCEL_STOP_RESPONSE)
            .getResponse();
    }
};
