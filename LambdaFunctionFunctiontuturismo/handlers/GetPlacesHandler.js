import * as Alexa from 'ask-sdk-core';

export const GetPlacesHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetPlacesIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Aquí podrías recomendar lugares turísticos según la intención del usuario.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
