import * as Alexa from 'ask-sdk-core';
import { GREETING } from '../utils/constants.js';
import { sanitizeInput } from '../utils/helpers.js';

export const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const name = sanitizeInput(handlerInput.requestEnvelope.request?.intent?.slots?.name?.value || '');
        const speakOutput = name ? `${GREETING} ${name}.` : GREETING;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
