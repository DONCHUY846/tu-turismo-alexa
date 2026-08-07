import * as Alexa from 'ask-sdk-core';

export const NoIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        const attrs = handlerInput.attributesManager.getSessionAttributes();

        if (attrs.pendingRemoveFavorite) {
            delete attrs.pendingRemoveFavorite;
            handlerInput.attributesManager.setSessionAttributes(attrs);
            return handlerInput.responseBuilder
                .speak('Está bien, no eliminé nada. ¿Quieres hacer algo más?')
                .reprompt('¿Qué te gustaría hacer?')
                .getResponse();
        }

        if (attrs.pendingAction === 'asking_location') {
            delete attrs.pendingAction;
            delete attrs.pendingIntent;
            handlerInput.attributesManager.setSessionAttributes(attrs);
            return handlerInput.responseBuilder
                .speak('Está bien, dime qué buscas cuando quieras. Puedes pedir recomendaciones diciendo "busca lugares en Guadalajara".')
                .reprompt('¿Qué te gustaría hacer?')
                .getResponse();
        }

        if (attrs.ultimosItems && attrs.ultimosItems.length > 0) {
            delete attrs.ultimosItems;
            handlerInput.attributesManager.setSessionAttributes(attrs);
            const speechOutput = 'Está bien, no guardaré nada. ¿Buscamos alguna otra recomendación en Jalisco?';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt('Puedes pedir recomendaciones diciendo "busca lugares en Guadalajara".')
                .getResponse();
        }

        return handlerInput.responseBuilder
            .speak('Perfecto. ¿En qué más te puedo ayudar?')
            .reprompt('Dime si quieres conocer lugares, eventos o restaurantes de Jalisco.')
            .getResponse();
    }
};