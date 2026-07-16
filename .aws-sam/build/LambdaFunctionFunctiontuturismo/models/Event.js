import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, default: '' },
    categoria_id: { type: String, default: '69b9b8c2bd4834e092048294' },
    fecha: { type: Date, default: null },
    lugar_nombre: { type: String, default: '' },
    ubicacion: { type: Object, default: {} },
    rating: { type: Number, default: 0 }
}, {
    collection: 'eventos',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
