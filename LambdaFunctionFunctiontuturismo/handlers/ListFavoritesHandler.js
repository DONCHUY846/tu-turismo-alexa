import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { Favorite } from '../models/Favorite.js';
import { Place } from '../models/Place.js';
import { Event } from '../models/Event.js';
import { Restaurant } from '../models/Restaurant.js';
import { RESPUESTAS } from '../constants.js';

const MODELOS_POR_TIPO = {
    lugar: Place,
    evento: Event,
    restaurante: Restaurant
};

export const ListFavoritesHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ListFavoritesIntent';
    },
    async handle(handlerInput) {
        const attrs = handlerInput.attributesManager.getSessionAttributes();
        const usuarioId = attrs.usuarioId;

        if (!usuarioId) {
            return handlerInput.responseBuilder
                .speak(RESPUESTAS.SIN_CUENTA)
                .reprompt(RESPUESTAS.SIN_CUENTA)
                .getResponse();
        }

        try {
            await connectToDatabase();

            const favoritos = await Favorite.find({ user_id: usuarioId }).sort({ fecha_guardado: 1 });

            if (favoritos.length === 0) {
                const speechOutput = 'Todavía no tienes favoritos guardados. Puedes pedir lugares, eventos o restaurantes y decir el primero, el segundo o el tercero para guardar uno.';
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt('¿Qué te gustaría buscar?')
                    .getResponse();
            }

            const items = [];
            for (const fav of favoritos) {
                const Modelo = MODELOS_POR_TIPO[fav.tipo];
                if (!Modelo) continue;
                let doc = null;
                try {
                    doc = await Modelo.findById(fav.referencia_id);
                } catch (e) {
                    doc = null;
                }
                items.push({
                    id: fav.referencia_id,
                    nombre: doc?.nombre || 'Elemento',
                    tipo: fav.tipo,
                    referencia_id: fav.referencia_id,
                    descripcion: doc?.descripcion || ''
                });
            }

            if (items.length === 0) {
                const speechOutput = 'Tus favoritos no se pudieron recuperar. Inténtalo de nuevo más tarde.';
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt(speechOutput)
                    .getResponse();
            }

            attrs.ultimosFavoritos = items;
            delete attrs.ultimosItems;
            handlerInput.attributesManager.setSessionAttributes(attrs);

            const visibles = items.slice(0, 3);
            const ordinales = ['primero', 'segundo', 'tercero'];
            let speechOutput = `Tienes ${items.length} favoritos. `;
            visibles.forEach((item, index) => {
                speechOutput += `${ordinales[index]}: ${item.nombre}. `;
            });
            if (items.length > 3) {
                speechOutput += `Y otros ${items.length - 3} más. `;
            }
            speechOutput += 'Di el primero, el segundo o el tercero para eliminar tu favorito.';

            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt('Di el primero, el segundo o el tercero de tu favorito.')
                .getResponse();
        } catch (error) {
            console.error('Error al listar favoritos:', error);
            return handlerInput.responseBuilder
                .speak(RESPUESTAS.ERROR_GENERICO)
                .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
                .getResponse();
        }
    }
};