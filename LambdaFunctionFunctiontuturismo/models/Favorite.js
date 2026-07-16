import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
    usuario_id: { type: String, required: true },
    tipo: { type: String, enum: ['evento', 'lugar'], required: true },
    referencia_id: { type: String, required: true },
    fecha_guardado: { type: Date, default: Date.now }
}, {
    collection: 'favoritos',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Favorite = mongoose.models.Favorite || mongoose.model('Favorite', favoriteSchema);
