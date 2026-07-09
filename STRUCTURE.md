tu-turismo-skill/
│
├── package.json           # Dependencias (ask-sdk-core, mongodb o mongoose, dotenv)
├── .env                   # Variables de entorno (URI de MongoDB) - ¡Nunca subir a GitHub!
├── .gitignore
│
├── index.js               # Punto de entrada (El handler principal de tu función Lambda)
│
├── db/                    # Lógica de conexión a Base de Datos
│   └── connection.js      # Patrón para mantener la conexión a MongoDB activa
│
├── models/                # Modelos de datos (Ideal si usas Mongoose)
│   ├── Place.js           # Esquema de lugares
│   ├── Event.js           # Esquema de eventos
│   └── User.js            # Esquema para favoritos y Account Linking
│
├── handlers/              # Separación de la lógica por cada Intención (Intent)
│   ├── LaunchRequestHandler.js       # Cuando el usuario dice "Abre Tu Turismo"
│   ├── GetNewEventsHandler.js        # Lógica para RF-ALX-02 (Eventos nuevos)
│   ├── GetPlacesHandler.js           # Lógica para RF-ALX-01 (Recomendación de lugares)
│   ├── StartTourGuideHandler.js      # Lógica de la guía turística
│   ├── SessionEndedRequestHandler.js # Cierre de sesión de Alexa
│   └── ErrorHandler.js               # Para la ofuscación de errores (RNF del PDF)
│
└── utils/                 # Herramientas y utilidades compartidas
    ├── constants.js       # Textos de respuesta de Alexa (para no quemarlos en el código)
    └── helpers.js         # Funciones extra (ej. sanitización de entradas, formateo de fechas)