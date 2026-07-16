import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { Event } from '../models/Event.js';
import { WEBSITE_URL } from '../constants.js';

export const GetNewEventsHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetNewEventsIntent';
    },
    async handle(handlerInput) {
        try {
            await connectToDatabase();

            const eventos = await Event.find({}).limit(3);
            const totalCount = await Event.countDocuments({});

            if (eventos.length === 0) {
                const noEventsSpeech = 'Por el momento no tengo eventos culturales o turísticos próximos registrados en Jalisco. ¿Te gustaría buscar recomendaciones de lugares?';
                return handlerInput.responseBuilder
                    .speak(noEventsSpeech)
                    .reprompt('Dime si prefieres buscar lugares para visitar.')
                    .getResponse();
            }

            const items = eventos.map(e => ({
                id: e._id.toString(),
                nombre: e.nombre,
                tipo: 'evento'
            }));

            handlerInput.attributesManager.setSessionAttributes({
                ultimosItems: items
            });

            let speechOutput = 'Próximamente tenemos los siguientes eventos destacados. ';

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
