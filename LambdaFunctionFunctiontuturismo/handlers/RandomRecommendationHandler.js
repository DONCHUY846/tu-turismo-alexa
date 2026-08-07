import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { Place } from '../models/Place.js';
import { Event } from '../models/Event.js';
import { Restaurant } from '../models/Restaurant.js';
import { RESPUESTAS } from '../constants.js';

const MODELOS = [Place, Event, Restaurant];

export const RandomRecommendationHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomRecommendationIntent';
    },
    async handle(handlerInput) {
        try {
            await connectToDatabase();

            const muestras = await Promise.all(
                MODELOS.map(Modelo => Modelo.aggregate([{ $sample: { size: 1 } }]))
            );
            const candidatos = muestras.filter(m => m.length > 0).map(m => m[0]);

            if (candidatos.length === 0) {
                return handlerInput.responseBuilder
                    .speak('Lo siento, no encontré nada que recomendarte en este momento. Inténtalo de nuevo más tarde.')
                    .reprompt('Puedes intentarlo otra vez.')
                    .getResponse();
            }

            const doc = candidatos[Math.floor(Math.random() * candidatos.length)];
            let tipo = 'lugar';
            if (doc.fecha !== undefined) tipo = 'evento';
            else if (doc.horario !== undefined) tipo = 'restaurante';

            const nombre = doc.nombre || doc.name || 'Este lugar';
            const descripcion = doc.descripcion ? ` ${doc.descripcion}` : '';

            const attrs = handlerInput.attributesManager.getSessionAttributes();
            attrs.ultimosItems = [{
                id: doc._id.toString(),
                nombre,
                tipo
            }];
            delete attrs.ultimosFavoritos;
            handlerInput.attributesManager.setSessionAttributes(attrs);

            const speechOutput = `Te recomiendo ${nombre}.${descripcion} Si quieres guardarlo en tus favoritos, di primero.`;
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt('Di primero para guardarlo en favoritos, o pide otra recomendación.')
                .getResponse();
        } catch (error) {
            console.error('Error al recomendar:', error);
            return handlerInput.responseBuilder
                .speak(RESPUESTAS.ERROR_GENERICO)
                .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
                .getResponse();
        }
    }
};