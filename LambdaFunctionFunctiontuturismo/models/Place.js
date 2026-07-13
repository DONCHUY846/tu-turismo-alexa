import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, default: '' },
    categoria_id: { type: String, default: '' },
    ubicacion: { type: Object, default: {} },
    rating_promedio: { type: Number, default: 0 },
    direccion: { type: String, default: '' },
    imagenes: { type: [String], default: [] },
    rating: { type: Number, default: 0 }
}, {
    collection: 'lugars',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Place = mongoose.models.Place || mongoose.model('Place', placeSchema);
