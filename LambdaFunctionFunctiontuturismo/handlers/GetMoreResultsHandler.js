import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { Place } from '../models/Place.js';
import { Event } from '../models/Event.js';
import { Restaurant } from '../models/Restaurant.js';
import { WEBSITE_URL } from '../constants.js';

const MODELOS = {
    Place,
    Event,
    Restaurant
};

export const GetMoreResultsHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetMoreResultsIntent';
    },
    async handle(handlerInput) {
        const attrs = handlerInput.attributesManager.getSessionAttributes();
        const busqueda = attrs.ultimaBusqueda;

        if (!busqueda || !MODELOS[busqueda.modelo]) {
            const speechOutput = 'Primero pide una búsqueda, por ejemplo "lugares en Guadalajara".';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt(speechOutput)
                .getResponse();
        }

        try {
            await connectToDatabase();

            const Modelo = MODELOS[busqueda.modelo];
            const resultados = await Modelo.find(busqueda.filter)
                .sort(busqueda.sort || {})
                .skip(busqueda.offset)
                .limit(3)
                .maxTimeMS(25000);

            if (resultados.length === 0) {
                const speechOutput = 'No hay más resultados. Puedes ver el catálogo completo en ' + WEBSITE_URL + '.';
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt('¿Qué más te gustaría hacer?')
                    .getResponse();
            }

            const items = resultados.map(r => ({
                id: r._id.toString(),
                nombre: r.nombre || r.name || 'Elemento',
                tipo: busqueda.tipo
            }));

            attrs.ultimosItems = items;
            attrs.ultimaBusqueda = { ...busqueda, offset: busqueda.offset + resultados.length };
            handlerInput.attributesManager.setSessionAttributes(attrs);

            let speechOutput = 'Aquí tienes más resultados. ';
            const ordinales = ['primero', 'segundo', 'tercero'];
            items.forEach((item, index) => {
                speechOutput += `${ordinales[index]}: ${item.nombre}. `;
            });
            speechOutput += '¿Te gustaría guardar alguno en tus favoritos? Di el primero, el segundo o el tercero.';

            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt('Di el primero, el segundo o el tercero para guardar en favoritos.')
                .getResponse();
        } catch (error) {
            console.error('Error al obtener más resultados:', error);
            return handlerInput.responseBuilder
                .speak('Lo siento, no pude consultar más resultados. Inténtalo de nuevo más tarde.')
                .reprompt('Puedes intentarlo otra vez.')
                .getResponse();
        }
    }
};