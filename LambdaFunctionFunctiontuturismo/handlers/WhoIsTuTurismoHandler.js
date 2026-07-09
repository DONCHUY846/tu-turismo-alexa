import * as Alexa from 'ask-sdk-core';

export const WhoIsTuTurismoHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhoIsTuTurismoIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Tu Turismo es una skill de Alexa diseñada para ayudarte a descubrir lugares y eventos turísticos de forma rápida y sencilla.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
