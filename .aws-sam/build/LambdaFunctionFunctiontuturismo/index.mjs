import * as Alexa from 'ask-sdk-core';
import { LaunchRequestHandler } from './handlers/LaunchRequestHandler.js';
import { HelpIntentHandler } from './handlers/HelpIntentHandler.js';
import { CancelAndStopIntentHandler } from './handlers/CancelAndStopIntentHandler.js';
import { NavigateHomeIntentHandler } from './handlers/NavigateHomeIntentHandler.js';
import { FallbackIntentHandler } from './handlers/FallbackIntentHandler.js';
import { SessionEndedRequestHandler } from './handlers/SessionEndedRequestHandler.js';
import { ErrorHandler } from './handlers/ErrorHandler.js';
import { WhoIsTuTurismoHandler } from './handlers/WhoIsTuTurismoHandler.js';
import { UserGreetingIntentHandler } from './handlers/UserGreetingIntentHandler.js';
import { GetPlacesHandler } from './handlers/GetPlacesHandler.js';
import { GetNewEventsHandler } from './handlers/GetNewEventsHandler.js';
import { GetRestaurantsHandler } from './handlers/GetRestaurantsHandler.js';
import { AddFavoriteHandler } from './handlers/AddFavoriteHandler.js';
import { SelectFavoriteHandler } from './handlers/SelectFavoriteHandler.js';
import { InicioSesionHandler } from './handlers/InicioSesionHandler.js';

const skill = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        UserGreetingIntentHandler,
        WhoIsTuTurismoHandler,
        GetPlacesHandler,
        GetNewEventsHandler,
        GetRestaurantsHandler,
        InicioSesionHandler,
        AddFavoriteHandler,
        SelectFavoriteHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        NavigateHomeIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .create();

export const handler = async (event, context) => {
    return skill.invoke(event, context);
};

