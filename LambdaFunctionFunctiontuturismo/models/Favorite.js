import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    tipo: { type: String, enum: ['evento', 'lugar', 'restaurante'], required: true },
    referencia_id: { type: String, required: true },
    fecha_guardado: { type: Date, default: Date.now }
}, {
    collection: 'favorites',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
