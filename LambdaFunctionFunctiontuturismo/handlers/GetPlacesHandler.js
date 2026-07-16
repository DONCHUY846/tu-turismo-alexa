import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { Place } from '../models/Place.js';
import { sanitizeSlot } from '../utils/helpers.js';
import { WEBSITE_URL } from '../constants.js';

export const GetPlacesHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetPlacesIntent'
            );
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request?.intent?.slots;
        const ubicacionRaw = slots?.place?.value || '';
        const ubicacionSanitizada = sanitizeSlot(ubicacionRaw);
        if (!ubicacionSanitizada) {
            const speechReprompt = '¿De qué ciudad o municipio de Jalisco te gustaría recibir recomendaciones?';
            return handlerInput.responseBuilder
                .speak('¿De qué lugar de Jalisco te gustaría buscar recomendaciones? Por ejemplo, Zapopan o Tequila.')
                .reprompt(speechReprompt)
                .getResponse();
        }

        try {
            await connectToDatabase();

            const filter = {
                $or: [
                    { nombre: { $regex: new RegExp(ubicacionSanitizada, 'i') } },
                    { descripcion: { $regex: new RegExp(ubicacionSanitizada, 'i') } },
                    { direccion: { $regex: new RegExp(ubicacionSanitizada, 'i') } }
                ]
            };
            const totalCount = await Place.countDocuments(filter);
            const lugares = await Place.find(filter).maxTimeMS(25000).limit(3);

            if (lugares.length === 0) {
                const noResultsSpeech = `Lo siento, en este momento no tengo recomendaciones registradas para ${ubicacionSanitizada}. ¿Quieres intentar con otra ciudad?`;
                return handlerInput.responseBuilder
                    .speak(noResultsSpeech)
                    .reprompt('Prueba diciendo otra ubicación de Jalisco.')
                    .getResponse();
            }

            let speechOutput = `Tengo varias recomendaciones en ${ubicacionSanitizada}. `;
            lugares.forEach((lugar, index) => {
                const nombre = lugar.nombre || lugar.name || 'Lugar turístico';
                const descripcion = lugar.descripcion || lugar.description || 'un lugar interesante para visitar';
                speechOutput += `${index + 1}: ${nombre}. ${descripcion}. `;
            });
            if (totalCount > 3) {
                speechOutput += `Hay más lugares disponibles. Puedes ver el catálogo completo en ${WEBSITE_URL}. `;
            }
            speechOutput += '¿Te gustaría saber más de alguno o prefieres guardar alguno en tus favoritos?';

            const response = handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt('Dime si deseas buscar en otro municipio.')
                .getResponse();
            return response;
        } catch (error) {
            console.error('Error al buscar lugares:', error);
            return handlerInput.responseBuilder
                .speak('Lo siento, no pude consultar las recomendaciones en este momento. Inténtalo de nuevo más tarde.')
                .reprompt('Puedes intentarlo otra vez.')
                .getResponse();
        }
    }
};
