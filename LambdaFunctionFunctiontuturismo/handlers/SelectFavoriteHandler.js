import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { Favorite } from '../models/Favorite.js';
import { RESPUESTAS } from '../constants.js';

export const SelectFavoriteHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SelectFavoriteIntent';
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
            const rawNumero = (slots?.numero?.value || '').toLowerCase().replace(/^(el|la|el\s+numero|numero)\s+/i, '');
            const mapOrdinal = { 'primero': 1, 'primer': 1, 'uno': 1, 'segundo': 2, 'dos': 2, 'tercero': 3, 'tercer': 3, 'tres': 3 };
            const numero = parseInt(rawNumero, 10) || mapOrdinal[rawNumero] || 0;

            if (!numero || numero < 1 || numero > 3) {
                const speechOutput = 'Por favor, di un número del 1 al 3 para guardar en favoritos.';
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt(speechOutput)
                    .getResponse();
            }

            const items = sessionAttributes.ultimosItems || [];

            const item = items[numero - 1];

            if (!item) {
                const speechOutput = 'No encontré ese elemento. Pide recomendaciones primero.';
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt('Di "busca lugares en Guadalajara" para empezar.')
                    .getResponse();
            }

            const existe = await Favorite.findOne({
                usuario_id: usuarioId,
                referencia_id: item.id
            });

            if (existe) {
                const speechOutput = `${item.nombre} ya está en tus favoritos.`;
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
                    .getResponse();
            }

            await Favorite.create({
                usuario_id: usuarioId,
                tipo: item.tipo,
                referencia_id: item.id,
                fecha_guardado: new Date()
            });

            const speechOutput = `¡Listo! He guardado ${item.nombre} en tus favoritos.`;
            return handlerInput.responseBuilder
                .speak(speechOutput)
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
