import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { Favorite } from '../models/Favorite.js';
import { RESPUESTAS } from '../constants.js';

export const YesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    async handle(handlerInput) {
        const attrs = handlerInput.attributesManager.getSessionAttributes();

        if (!attrs.pendingRemoveFavorite) {
            return handlerInput.responseBuilder
                .speak('Perfecto. ¿En qué más te puedo ayudar?')
                .reprompt('Dime si quieres conocer lugares, eventos o restaurantes de Jalisco.')
                .getResponse();
        }

        const { referencia_id, tipo, nombre } = attrs.pendingRemoveFavorite;
        const usuarioId = attrs.usuarioId;

        if (!usuarioId) {
            return handlerInput.responseBuilder
                .speak(RESPUESTAS.SIN_CUENTA)
                .reprompt(RESPUESTAS.SIN_CUENTA)
                .getResponse();
        }

        try {
            await connectToDatabase();

            await Favorite.deleteOne({
                user_id: usuarioId,
                referencia_id,
                tipo
            });

            delete attrs.pendingRemoveFavorite;
            handlerInput.attributesManager.setSessionAttributes(attrs);

            const speechOutput = `Listo, he eliminado ${nombre} de tus favoritos. ¿En qué más te puedo ayudar?`;
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
                .getResponse();
        } catch (error) {
            console.error('Error al eliminar favorito:', error);
            return handlerInput.responseBuilder
                .speak(RESPUESTAS.ERROR_GENERICO)
                .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
                .getResponse();
        }
    }
};