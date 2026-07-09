import * as Alexa from 'ask-sdk-core';

export const GetNewEventsHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetNewEventsIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Aquí podrías mostrar los eventos nuevos recomendados para el usuario.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
