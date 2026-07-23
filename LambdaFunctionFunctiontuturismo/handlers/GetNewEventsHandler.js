import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { Event } from '../models/Event.js';
import { sanitizeSlot } from '../utils/helpers.js';
import { WEBSITE_URL } from '../constants.js';

export const GetNewEventsHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetNewEventsIntent';
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request?.intent?.slots;
        const ubicacionRaw = slots?.place?.value || '';
        const ubicacionSanitizada = sanitizeSlot(ubicacionRaw);

        if (!ubicacionSanitizada) {
            const speechReprompt = '¿De qué ciudad o municipio de Jalisco te gustaría buscar eventos?';
            return handlerInput.responseBuilder
                .speak('¿De qué lugar de Jalisco te gustaría buscar eventos? Por ejemplo, Guadalajara o Tequila.')
                .reprompt(speechReprompt)
                .getResponse();
        }

        try {
            await connectToDatabase();

            const filter = {
                $or: [
                    { nombre: { $regex: new RegExp(ubicacionSanitizada, 'i') } },
                    { descripcion: { $regex: new RegExp(ubicacionSanitizada, 'i') } },
                    { lugar_nombre: { $regex: new RegExp(ubicacionSanitizada, 'i') } }
                ]
            };
            const totalCount = await Event.countDocuments(filter);
            const eventos = await Event.find(filter).maxTimeMS(25000).limit(3);

            if (eventos.length === 0) {
                const noResultsSpeech = `Lo siento, no encontré eventos en ${ubicacionSanitizada}. ¿Quieres intentar con otra ciudad?`;
                return handlerInput.responseBuilder
                    .speak(noResultsSpeech)
                    .reprompt('Prueba diciendo otra ubicación de Jalisco.')
                    .getResponse();
            }

            const items = eventos.map(e => ({
                id: e._id.toString(),
                nombre: e.nombre,
                tipo: 'evento'
            }));

            const attrs = handlerInput.attributesManager.getSessionAttributes();
            attrs.ultimosItems = items;
            handlerInput.attributesManager.setSessionAttributes(attrs);

            let speechOutput = `Próximamente tenemos los siguientes eventos destacados en ${ubicacionSanitizada}. `;

            items.forEach((item, index) => {
                speechOutput += `${index + 1}: ${item.nombre}. `;
            });

            if (totalCount > 3) {
                speechOutput += `Hay más eventos disponibles. Puedes ver el catálogo completo en ${WEBSITE_URL}. `;
            }

            speechOutput += '¿Te gustaría guardar alguno en tus favoritos? Di el número.';

            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt('Di el número del evento que quieres guardar.')
                .getResponse();

        } catch (error) {
            console.error('Error al buscar eventos:', error);
            return handlerInput.responseBuilder
                .speak('Lo siento, no pude consultar los eventos en este momento. Inténtalo de nuevo más tarde.')
                .reprompt('Puedes intentarlo otra vez.')
                .getResponse();
        }
    }
};
