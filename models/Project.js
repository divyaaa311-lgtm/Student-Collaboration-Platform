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
        type: [String],
        default: []
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 📅 Smart Deadline: Never breaks, automatically defaults to 7 days from now if missing
    deadline: {
        type: Date,
        default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)
    },
    // 👥 Applicants Array Tracker
    applicants: {
        type: [{
            studentName: String,
            studentEmail: String,
            linkedinUrl: String,
            introduction: String,
            appliedAt: { type: Date, default: Date.now }
        }],
        default: [] // Ensures it is always initialized as an empty array
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
