import * as Alexa from 'ask-sdk-core';
import { ERROR_RESPONSE } from '../utils/constants.js';

export const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error manejado: ${error.stack}`);

        return handlerInput.responseBuilder
            .speak(ERROR_RESPONSE)
            .reprompt(ERROR_RESPONSE)
            .getResponse();
    }
};
