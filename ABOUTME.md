# Documento de Requerimientos de Producto (PRD)

**Proyecto:** Tu-Turismo Alexa Skill
**Plataforma:** Amazon Alexa Skills Kit (ASK) + AWS Lambda + MongoDB

## 1. Visión General

El objetivo de este proyecto es integrar una Alexa Skill que actúe como un asistente personal impulsado por voz para turistas durante su visita a Jalisco. El sistema permitirá realizar consultas en tiempo real sobre recomendaciones de lugares, eventos vigentes y fungir como un guía turístico sin necesidad de una interfaz visual.

## 2. Arquitectura y Stack Tecnológico

Debido a bloqueos de desarrollo en la API principal, la arquitectura de la Skill funcionará de manera independiente al backend web actual.

* **Voz e Interacción:** Amazon Alexa Skills Kit (ASK).
* **Procesamiento (Capa Lógica):** AWS Lambda (Node.js).
* **Base de Datos:** Conexión directa a MongoDB vía driver nativo (ej. `Mongoose`).



## 3. Requerimientos Funcionales (RF)

| ID | Módulo | Descripción | Prioridad |
| --- | --- | --- | --- |
| **RF-ALX-01** | Recomendación de Lugares | El sistema conectará con MongoDB para responder intenciones sobre qué lugares visitar, filtrando resultados por ubicación (ej. Zapopan) o interés general.

 | Alta |
| **RF-ALX-02** | Consulta de Eventos Nuevos | La función Lambda consultará los eventos culturales y turísticos próximos o recién agregados, devolviendo a Alexa el título, fecha y ubicación.

 | Alta |
| **RF-ALX-04** | Sincronización de Favoritos | Se debe soportar *Account Linking*. La función Lambda tomará el token de usuario, buscará su documento en MongoDB y guardará las recomendaciones en la lista "Mis Favoritos".

 | Alta |

## 4. Requerimientos No Funcionales (RNF)

* 
**Latencia y Rendimiento (Crítico para Lambda):** La función Lambda debe conectarse a MongoDB, ejecutar la consulta y devolver el JSON a Alexa en menos de 3 segundos para evitar el *timeout* de la plataforma de Amazon. Se recomienda mantener conexiones persistentes a la base de datos fuera del *handler* principal de la función para mitigar tiempos de arranque frío (*cold starts*).


* 
**Sanitización de Entradas:** Aunque no se use Django de intermediario, los *slots* (variables de voz) extraídos por Alexa y enviados a Lambda deben ser sanitizados para prevenir riesgos de inyección NoSQL en MongoDB.


* 
**Ofuscación de Errores:** Si ocurre un error de conexión con MongoDB (ej. timeout o error interno), la función no debe devolver un *Stack Trace*. En su lugar, se debe retornar una respuesta genérica en voz indicando que el servicio no está disponible temporalmente.



## 5. Casos de Uso: Voice User Interface (VUI)

| Intención (Intent) | Expresión del Usuario (Utterance) | Respuesta Esperada del Sistema (Alexa) |
| --- | --- | --- |
| `GetNewEventsIntent` | "Alexa, pregúntale a Tu-Turismo si hay eventos nuevos hoy." 

 | "Hoy tenemos un evento cultural en Guadalajara a las 5 de la tarde. ¿Te gustaría que lo guarde en tu lista de eventos guardados?" 

 |
| `GetPlacesRecommendationsIntent` | "Alexa, pide a Tu-Turismo lugares para visitar cerca de Zapopan." 

 | "Tengo varios lugares cerca de Zapopan. Uno muy recomendado es el Centro Comercial Andares. ¿Quieres escuchar más detalles?" 

 |
| `StartTourGuideIntent` | "Alexa, dile a Tu-Turismo que sea mi guía en el pueblo mágico de Tequila." 

 | "¡Claro! Bienvenido a la tierra del agave. Te sugiero comenzar el recorrido por la plaza principal. La historia de este lugar destaca por..." 

 |

## 6. Flujo de Datos Actualizado (Vía Lambda)

A diferencia del flujo propuesto originalmente mediante un webhook HTTP (POST) hacia una API REST, el flujo adaptado funcionará de la siguiente manera:

1. **Invocación:** El turista habla a su dispositivo Echo o aplicación móvil.
2. **Procesamiento NLP:** Amazon ASK procesa la expresión y determina el *Intent* y los *Slots* (ej. Ciudad: "Zapopan").
3. **Ejecución Lambda:** Amazon ASK invoca directamente la función de AWS Lambda asignada a la Skill.
4. **Conexión a Base de Datos:** La función Lambda establece conexión nativa utilizando la URI de MongoDB para extraer la colección de lugares, eventos o perfiles de usuario correspondientes.
5. **Construcción de Respuesta:** Lambda toma los datos estructurados, arma la respuesta en texto (y directivas de formato SSML) y la devuelve a Amazon ASK, quien utiliza *Text-to-Speech* para hablarle al usuario.