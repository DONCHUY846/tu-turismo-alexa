import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { User } from '../models/User.js';
import { Favorite } from '../models/Favorite.js';
import { RESPUESTAS } from '../constants.js';

export const AddFavoriteHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddFavoriteIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope } = handlerInput;

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
