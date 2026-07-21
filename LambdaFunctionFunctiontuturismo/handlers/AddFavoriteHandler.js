import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { Favorite } from '../models/Favorite.js';
import { RESPUESTAS } from '../constants.js';

export const AddFavoriteHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddFavoriteIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, attributesManager } = handlerInput;

        try {
            await connectToDatabase();

            const sessionAttributes = attributesManager.getSessionAttributes();
            const usuarioId = sessionAttributes.usuarioId;

            if (!usuarioId) {
                return handlerInput.responseBuilder
                    .speak(RESPUESTAS.SIN_CUENTA)
                    .reprompt(RESPUESTAS.SIN_CUENTA)
                    .getResponse();
            }

            const slots = requestEnvelope.request?.intent?.slots || {};
            const referenciaId = slots?.referencia_id?.value || '';
            const tipo = slots?.tipo?.value || 'lugar';

            if (!referenciaId) {
                const speechOutput = '¿Qué lugar o evento quieres guardar en favoritos?';
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt(speechOutput)
                    .getResponse();
            }

            const existeFavorito = await Favorite.findOne({
                usuario_id: usuarioId,
                referencia_id: referenciaId
            });

            if (existeFavorito) {
                const speechOutput = 'Este elemento ya está en tu lista de favoritos.';
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
                    .getResponse();
            }

            await Favorite.create({
                usuario_id: usuarioId,
                tipo,
                referencia_id: referenciaId,
                fecha_guardado: new Date()
            });

            return handlerInput.responseBuilder
                .speak(RESPUESTAS.GUARDADO_EXITO)
                .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
                .getResponse();

        } catch (error) {
            console.error('Error al guardar favorito:', error);
            return handlerInput.responseBuilder
                .speak(RESPUESTAS.ERROR_GENERICO)
                .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
                .getResponse();
        }
    }
};
