import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, default: '' },
    direccion: { type: String, default: '' },
    telefono: { type: String, default: '' },
    horario: { type: String, default: '' },
    web: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    rating_promedio: { type: Number, default: 0 },
    imagenes: { type: [String], default: [] },
    ubicacion: { type: Object, default: {} }
}, {
    collection: 'restaurantes',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
