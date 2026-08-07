import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { Restaurant } from '../models/Restaurant.js';
import { sanitizeSlot, serializeFilter } from '../utils/helpers.js';
import { WEBSITE_URL } from '../constants.js';

export const GetRestaurantsHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetRestaurantsIntent';
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request?.intent?.slots;
        const ubicacionRaw = slots?.place?.value || '';
        const ubicacionSanitizada = sanitizeSlot(ubicacionRaw);
        if (!ubicacionSanitizada) {
            const attrs = handlerInput.attributesManager.getSessionAttributes();
            attrs.pendingAction = 'asking_location';
            attrs.pendingIntent = 'GetRestaurantsIntent';
            handlerInput.attributesManager.setSessionAttributes(attrs);
            const speechReprompt = '¿De qué ciudad o municipio de Jalisco te gustaría buscar restaurantes?';
            return handlerInput.responseBuilder
                .speak('¿De qué lugar de Jalisco te gustaría buscar restaurantes? Por ejemplo, Guadalajara o Tequila.')
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
            const totalCount = await Restaurant.countDocuments(filter);
            const restaurantes = await Restaurant.find(filter).maxTimeMS(25000).limit(3);

            if (restaurantes.length === 0) {
                const noResultsSpeech = `Lo siento, en este momento no tengo restaurantes registrados en ${ubicacionSanitizada}. ¿Quieres intentar con otra ciudad?`;
                return handlerInput.responseBuilder
                    .speak(noResultsSpeech)
                    .reprompt('Prueba diciendo otra ubicación de Jalisco.')
                    .getResponse();
            }

            const items = restaurantes.map(r => ({
                id: r._id.toString(),
                nombre: r.nombre,
                tipo: 'restaurante'
            }));

            const attrs = handlerInput.attributesManager.getSessionAttributes();
            attrs.ultimosItems = items;
            attrs.ultimaBusqueda = {
                modelo: 'Restaurant',
                tipo: 'restaurante',
                filter: serializeFilter(filter),
                sort: {},
                offset: 3
            };
            handlerInput.attributesManager.setSessionAttributes(attrs);

            let speechOutput = `Tengo varias recomendaciones de restaurantes en ${ubicacionSanitizada}. `;
            const ordinales = ['primero', 'segundo', 'tercero'];
            items.forEach((item, index) => {
                speechOutput += `${ordinales[index]}: ${item.nombre}. `;
            });
            if (totalCount > 3) {
                speechOutput += `Hay más restaurantes disponibles. Puedes ver el catálogo completo en ${WEBSITE_URL}. `;
            }
            speechOutput += '¿Te gustaría guardar alguno en tus favoritos? Di el primero, el segundo o el tercero.';

            const response = handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt('Di el primero, el segundo o el tercero para guardar en favoritos.')
                .getResponse();
            return response;
        } catch (error) {
            console.error('Error al buscar restaurantes:', error);
            return handlerInput.responseBuilder
                .speak('Lo siento, no pude consultar los restaurantes en este momento. Inténtalo de nuevo más tarde.')
                .reprompt('Puedes intentarlo otra vez.')
                .getResponse();
        }
    }
};
