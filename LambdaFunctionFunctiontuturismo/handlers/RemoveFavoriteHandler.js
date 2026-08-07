import * as Alexa from 'ask-sdk-core';

export const RemoveFavoriteHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RemoveFavoriteIntent';
    },
    handle(handlerInput) {
        const attrs = handlerInput.attributesManager.getSessionAttributes();
        const slots = handlerInput.requestEnvelope.request?.intent?.slots || {};
        const rawNumero = (slots?.numero?.value || '').toLowerCase().replace(/^(el|la|el\s+numero|numero)\s+/i, '');
        const mapOrdinal = { 'primero': 1, 'primer': 1, 'uno': 1, 'segundo': 2, 'dos': 2, 'tercero': 3, 'tercer': 3, 'tres': 3 };
        const numero = parseInt(rawNumero, 10) || mapOrdinal[rawNumero] || 0;

        const items = attrs.ultimosFavoritos || [];

        if (!numero || numero < 1 || numero > items.length) {
            const ordinales = ['primero', 'segundo', 'tercero', 'cuarto', 'quinto'];
            const limite = items.length > 5 ? 'el quinto' : ordinales[items.length - 1];
            const speechOutput = items.length > 0
                ? `Por favor, di del primero al ${limite} para elegir el favorito a eliminar.`
                : 'Primero dime "cuáles son mis favoritos" para ver tu lista.';
            return handlerInput.responseBuilder
                .speak(speechOutput)
                .reprompt(speechOutput)
                .getResponse();
        }

        const item = items[numero - 1];
        attrs.pendingRemoveFavorite = {
            referencia_id: item.referencia_id,
            tipo: item.tipo,
            nombre: item.nombre
        };
        handlerInput.attributesManager.setSessionAttributes(attrs);

        const speechOutput = `¿Quieres eliminar ${item.nombre} de tus favoritos? Di sí o no.`;
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt('Di sí para eliminar, o no para cancelar.')
            .getResponse();
    }
};