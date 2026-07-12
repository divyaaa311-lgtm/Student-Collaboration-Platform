const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    skillsRequired: {
        type: [String], // Array of skills, e.g., ["React", "Python"]
        default: []
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId, // Links the project to the specific User ID who made it
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
