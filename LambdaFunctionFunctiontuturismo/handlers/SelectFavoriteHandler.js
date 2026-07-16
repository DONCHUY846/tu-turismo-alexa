import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { User } from '../models/User.js';
import { Favorite } from '../models/Favorite.js';
import { RESPUESTAS } from '../constants.js';

export const SelectFavoriteHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SelectFavoriteIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, attributesManager } = handlerInput;

        const accessToken = Alexa.getAccountLinkingAccessToken(requestEnvelope);
        const userId = requestEnvelope.context?.System?.user?.userId;

        try {
            await connectToDatabase();

            let usuarioId;

            if (accessToken) {
                const email = accessToken.includes('@')
                    ? accessToken
                    : `${accessToken}@tu-turismo.com.mx`;
                const usuario = await User.findOne({ email });
                if (usuario) {
                    usuarioId = usuario._id.toString();
                }
            }

            if (!usuarioId) {
                if (!userId) {
                    return handlerInput.responseBuilder
                        .speak(RESPUESTAS.SIN_CUENTA)
                        .withLinkAccountCard()
                        .getResponse();
                }
                usuarioId = userId;
            }

            const slots = requestEnvelope.request?.intent?.slots || {};
            const numero = parseInt(slots?.numero?.value, 10);

            if (!numero || numero < 1 || numero > 3) {
                const speechOutput = 'Por favor, di un número del 1 al 3 para guardar en favoritos.';
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt(speechOutput)
                    .getResponse();
            }

            const sessionAttributes = attributesManager.getSessionAttributes();
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
