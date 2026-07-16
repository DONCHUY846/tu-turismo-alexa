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

            let speechOutput = 'Próximamente en Jalisco tenemos los siguientes eventos destacados. ';

            eventos.forEach((evento) => {
                if (evento.fecha) {
                    const opciones = { day: 'numeric', month: 'long' };
                    const fechaLegible = evento.fecha.toLocaleDateString('es-MX', opciones);
                    speechOutput += `El ${fechaLegible} se llevará a cabo ${evento.nombre}. `;
                } else {
                    speechOutput += `${evento.nombre}. `;
                }
            });

            if (totalCount > 3) {
                speechOutput += `Hay más eventos disponibles. Puedes ver el catálogo completo en ${WEBSITE_URL}. `;
            }

            speechOutput += '¿Te gustaría que guarde alguno de estos eventos en tus favoritos?';

            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt('¿Deseas escuchar nuevamente los eventos o buscar otra cosa?')
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
