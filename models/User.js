import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    count: {
        type: Number,
        required: true,
        default: 0
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    platform: {
        type: String,
        enum: ['leetcode', 'codeforces', 'codechef'],
        required: true
    },
    solvedCount: {
        type: Number,
        default: 0
    },
    contestRank: {
        type: Number
    },
    rating: {
        type: Number
    },
    submissions: [submissionSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
userSchema.index({ platform: 1, solvedCount: -1 });
userSchema.index({ 'submissions.date': 1 });
userSchema.index({ lastUpdated: -1 });

const User = mongoose.model('User', userSchema);

export default User; 