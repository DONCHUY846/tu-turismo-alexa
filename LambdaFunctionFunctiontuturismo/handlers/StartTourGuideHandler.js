import * as Alexa from 'ask-sdk-core';

export const StartTourGuideHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartTourGuideIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Aquí iniciarías la guía turística interactiva.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
