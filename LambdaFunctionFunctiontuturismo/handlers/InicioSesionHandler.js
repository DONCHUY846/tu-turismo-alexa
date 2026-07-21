import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { User } from '../models/User.js';
import { RESPUESTAS } from '../constants.js';

export const InicioSesionHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'InicioSesionIntent';
    },
    async handle(handlerInput) {
        const { requestEnvelope, attributesManager } = handlerInput;

        const slots = requestEnvelope.request?.intent?.slots || {};
        const rawEmail = slots?.email?.value || '';

        if (!rawEmail) {
            return handlerInput.responseBuilder
                .speak(RESPUESTAS.CORREO_INVALIDO)
                .reprompt('Di "mi correo es" y luego tu correo electrónico.')
                .getResponse();
        }

        const email = rawEmail
            .toLowerCase()
            .replace(/\s*arroba\s*/g, '@')
            .replace(/\s*punto\s*/g, '.')
            .replace(/\s+/g, '')
            .replace(/\[at\]|\(at\)/g, '@')
            .replace(/\[dot\]|\(dot\)/g, '.');

        if (!email.includes('@')) {
            return handlerInput.responseBuilder
                .speak('No entendí tu correo. Intenta diciendo "mi correo es admin arroba tuturismo punto com".')
                .getResponse();
        }

        try {
            await connectToDatabase();

            const usuario = await User.findOne({ email });

            if (!usuario) {
                return handlerInput.responseBuilder
                    .speak('No encontré una cuenta con ese correo. Verifica que esté registrado en tu-turismo.com.')
                    .getResponse();
            }

            const sessionAttributes = attributesManager.getSessionAttributes();
            sessionAttributes.usuarioId = usuario._id.toString();
            attributesManager.setSessionAttributes(sessionAttributes);

            return handlerInput.responseBuilder
                .speak(`Bienvenido ${usuario.nombre}, he vinculado tu cuenta. Ahora puedes guardar lugares en favoritos.`)
                .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
                .getResponse();

        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            return handlerInput.responseBuilder
                .speak(RESPUESTAS.ERROR_GENERICO)
                .getResponse();
        }
    }
};
