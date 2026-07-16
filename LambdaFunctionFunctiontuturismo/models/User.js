import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, default: '' },
    email: { type: String, required: true },
    telefono: { type: String, default: '' },
    rol: { type: String, default: 'turista' },
    password: { type: String, required: true }
}, {
    collection: 'users',
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
