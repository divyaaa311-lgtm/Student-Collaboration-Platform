const mongoose = require('mongoose');

// This defines the structure of a single user profile in the database
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // The user MUST provide a name
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // No two users can have the same email
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    skills: {
        type: [String], // An array of strings, e.g., ["React", "Node.js", "Python"]
        default: []
    },
    projects: [
        {
            title: String,
            description: String,
            link: String
        }
    ]
}, { timestamps: true }); // Automatically adds "createdAt" and "updatedAt" timestamps

// Export the blueprint so we can use it in other files
module.exports = mongoose.model('User', UserSchema);
