import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase() {
    if (isConnected) {
        return mongoose.connection;
    }

    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI no está definida en las variables de entorno.');
    }

    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
    });

    isConnected = true;
    console.log('Conexión a MongoDB establecida.');
    return mongoose.connection;
}
