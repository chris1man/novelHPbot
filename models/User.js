const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: {
        type: Number,
        required: true,
        unique: true
    },
    firstName: String,
    house: {
        type: String,
        enum: ['Gryffindor', 'Slytherin', 'Ravenclaw', 'Hufflepuff'],
        default: null
    },
    stats: {
        closeness: { type: Number, default: 0 },
        darkness: { type: Number, default: 0 },
        trust: { type: Number, default: 0 }
    },
    flags: {
        type: [String],
        default: []
    },
    currentScene: {
        type: String,
        default: 'scene_1' // Assuming 'scene_1' is the start
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
