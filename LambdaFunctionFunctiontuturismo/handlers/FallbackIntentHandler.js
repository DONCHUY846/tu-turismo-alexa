import * as Alexa from 'ask-sdk-core';
import { connectToDatabase } from '../db/connection.js';
import { sanitizeSlot, serializeFilter } from '../utils/helpers.js';
import { Place } from '../models/Place.js';
import { Event } from '../models/Event.js';
import { Restaurant } from '../models/Restaurant.js';
import { Favorite } from '../models/Favorite.js';
import { WEBSITE_URL, RESPUESTAS } from '../constants.js';
import { RandomRecommendationHandler } from './RandomRecommendationHandler.js';
import { GetMoreResultsHandler } from './GetMoreResultsHandler.js';

async function handleNumberSelection(handlerInput, attrs, items, numero) {
    const item = items[numero - 1];
    const usuarioId = attrs.usuarioId;
    if (!usuarioId) {
        return handlerInput.responseBuilder
            .speak(RESPUESTAS.SIN_CUENTA)
            .reprompt(RESPUESTAS.SIN_CUENTA)
            .getResponse();
    }

    await connectToDatabase();
    const existe = await Favorite.findOne({
        user_id: usuarioId,
        referencia_id: item.id
    });

    if (existe) {
        return handlerInput.responseBuilder
            .speak(`${item.nombre} ya está en tus favoritos.`)
            .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
            .getResponse();
    }

    await Favorite.create({
        user_id: usuarioId,
        tipo: item.tipo,
        referencia_id: item.id,
        fecha_guardado: new Date()
    });

    return handlerInput.responseBuilder
        .speak(`¡Listo! He guardado ${item.nombre} en tus favoritos.`)
        .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
        .getResponse();
}

const INTENT_SEARCH_CONFIG = {
    GetNewEventsIntent: {
        model: Event,
        tipo: 'evento',
        extraFilter: (sanitized) => [{ lugar_nombre: { $regex: new RegExp(sanitized, 'i') } }]
    },
    GetPlacesIntent: {
        model: Place,
        tipo: 'lugar',
        extraFilter: () => []
    },
    GetRestaurantsIntent: {
        model: Restaurant,
        tipo: 'restaurante',
        extraFilter: () => []
    }
};

export const FallbackIntentHandler = {
    canHandle(handlerInput) {
        if (Alexa.getRequestType(handlerInput.requestEnvelope) !== 'IntentRequest') return false;
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        if (intentName === 'AMAZON.FallbackIntent') return true;
        if (intentName === 'AMAZON.NoIntent') return true;
        const attrs = handlerInput.attributesManager.getSessionAttributes();
        return attrs.pendingAction != null;
    },
    async handle(handlerInput) {
        const attrs = handlerInput.attributesManager.getSessionAttributes();
        const utterance = handlerInput.requestEnvelope.request?.intent?.slots?.utterance?.value
            || handlerInput.requestEnvelope.request?.intent?.slots?.allKeywords?.value
            || '';

        const fraseBaja = utterance.toLowerCase().trim();

        const palabrasSorprendeme = ['sorpréndeme', 'sorprendeme', 'recomiéndame', 'recomiendame', 'recomiéndame algo', 'recomiendame algo', 'dame una recomendación', 'dame una recomendacion', 'sugiéreme', 'sugiereme', 'qué me recomiendas', 'que me recomiendas'];
        if (palabrasSorprendeme.some(p => fraseBaja === p || fraseBaja.includes(p))) {
            return RandomRecommendationHandler.handle(handlerInput);
        }

        const palabrasMas = ['más', 'mas', 'muéstrame más', 'muestrame mas', 'muéstrame más resultados', 'ver más', 'ver mas', 'siguientes', 'hay más', 'hay mas', 'mostrar más', 'mostrar mas', 'más resultados', 'mas resultados'];
        if (palabrasMas.some(p => fraseBaja === p || fraseBaja.includes(p))) {
            return GetMoreResultsHandler.handle(handlerInput);
        }

        if (attrs.ultimosItems && attrs.ultimosItems.length > 0) {
            const negaciones = ['no', 'no gracias', 'ninguno', 'ninguna', 'no quiero guardar', 'no quiero', 'no guardes', 'no guardar'];
            if (negaciones.some(palabra => fraseBaja === palabra || fraseBaja.includes(palabra))) {
                delete attrs.ultimosItems;
                handlerInput.attributesManager.setSessionAttributes(attrs);
                const speechOutput = 'Está bien, no guardaré nada. ¿Buscamos alguna otra recomendación en Jalisco?';
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt('Puedes pedir recomendaciones diciendo "busca lugares en Guadalajara".')
                    .getResponse();
            }

            const rawNumero = utterance.toLowerCase().replace(/^(el|la|el\s+numero|numero)\s+/i, '');
            const mapOrdinal = { 'primero': 1, 'primer': 1, 'uno': 1, 'segundo': 2, 'dos': 2, 'tercero': 3, 'tercer': 3, 'tres': 3 };
            const numero = parseInt(rawNumero, 10) || mapOrdinal[rawNumero] || 0;

            if (numero >= 1 && numero <= attrs.ultimosItems.length) {
                try {
                    await connectToDatabase();
                    return await handleNumberSelection(handlerInput, attrs, attrs.ultimosItems, numero);
                } catch (error) {
                    console.error('Error en fallback al seleccionar número:', error);
                    return handlerInput.responseBuilder
                        .speak(RESPUESTAS.ERROR_GENERICO)
                        .reprompt(RESPUESTAS.REPROMPT_FAVORITOS)
                        .getResponse();
                }
            }
        }

        if (attrs.pendingAction === 'asking_location' && attrs.pendingIntent) {
            if (!utterance) {
                const hint = 'Por favor, di el nombre de la ciudad después del comando. Por ejemplo, "eventos en Guadalajara".';
                return handlerInput.responseBuilder
                    .speak(hint)
                    .reprompt(hint)
                    .getResponse();
            }

            const ubicacionSanitizada = sanitizeSlot(utterance);
            if (ubicacionSanitizada) {
                const config = INTENT_SEARCH_CONFIG[attrs.pendingIntent];
                if (config) {
                    try {
                        await connectToDatabase();

                        const filter = {
                            $or: [
                                { nombre: { $regex: new RegExp(ubicacionSanitizada, 'i') } },
                                { descripcion: { $regex: new RegExp(ubicacionSanitizada, 'i') } },
                                { direccion: { $regex: new RegExp(ubicacionSanitizada, 'i') } },
                                ...config.extraFilter(ubicacionSanitizada)
                            ]
                        };

                        const totalCount = await config.model.countDocuments(filter);
                        const results = await config.model.find(filter).maxTimeMS(25000).limit(3);

                        if (results.length === 0) {
                            return handlerInput.responseBuilder
                                .speak(`Lo siento, no encontré resultados en ${ubicacionSanitizada}. ¿Quieres intentar con otra ciudad?`)
                                .reprompt('Prueba diciendo otra ubicación de Jalisco.')
                                .getResponse();
                        }

                        const items = results.map(r => ({
                            id: r._id.toString(),
                            nombre: r.nombre,
                            tipo: config.tipo
                        }));

                        delete attrs.pendingAction;
                        delete attrs.pendingIntent;
                        attrs.ultimosItems = items;
                        attrs.ultimaBusqueda = {
                            modelo: config.model.modelName,
                            tipo: config.tipo,
                            filter: serializeFilter(filter),
                            sort: {},
                            offset: 3
                        };
                        handlerInput.attributesManager.setSessionAttributes(attrs);

                        let speechOutput = `En ${ubicacionSanitizada} tenemos: `;
                        const ordinales = ['primero', 'segundo', 'tercero'];
                        items.forEach((item, index) => {
                            speechOutput += `${ordinales[index]}: ${item.nombre}. `;
                        });
                        if (totalCount > 3) {
                            speechOutput += `Hay más resultados disponibles. Puedes ver el catálogo completo en ${WEBSITE_URL}. `;
                        }
                        speechOutput += '¿Te gustaría guardar alguno en tus favoritos? Di el primero, el segundo o el tercero.';

                        return handlerInput.responseBuilder
                            .speak(speechOutput)
                            .reprompt('Di el primero, el segundo o el tercero para guardar en favoritos.')
                            .getResponse();
                    } catch (error) {
                        console.error('Error en fallback al buscar ubicación:', error);
                    }
                }
            }
        }

        const helpMsg = 'No entendí lo que dijiste. Puedes pedir recomendaciones diciendo "busca lugares en Guadalajara", "eventos en Tequila" o "restaurantes en Zapopan". ¿Qué te gustaría hacer?';
        return handlerInput.responseBuilder
            .speak(helpMsg)
            .reprompt(helpMsg)
            .getResponse();
    }
};
