import * as Alexa from 'ask-sdk-core';
import { LaunchRequestHandler } from './handlers/LaunchRequestHandler.js';
import { HelpIntentHandler } from './handlers/HelpIntentHandler.js';
import { CancelAndStopIntentHandler } from './handlers/CancelAndStopIntentHandler.js';
import { NavigateHomeIntentHandler } from './handlers/NavigateHomeIntentHandler.js';
import { SessionEndedRequestHandler } from './handlers/SessionEndedRequestHandler.js';
import { ErrorHandler } from './handlers/ErrorHandler.js';
import { WhoIsTuTurismoHandler } from './handlers/WhoIsTuTurismoHandler.js';
import { UserGreetingIntentHandler } from './handlers/UserGreetingIntentHandler.js';
import { GetPlacesHandler } from './handlers/GetPlacesHandler.js';

const skill = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        UserGreetingIntentHandler,
        WhoIsTuTurismoHandler,
        GetPlacesHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        NavigateHomeIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .create();

export const handler = async (event, context) => {
    return skill.invoke(event, context);
};

