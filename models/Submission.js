import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  submittedAt: {
    type: Date,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['leetcode', 'codeforces', 'codechef']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: String,
    required: true
  },
  problemTitle: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error']
  },
  language: {
    type: String,
    required: true
  },
  executionTime: {
    type: Number  // in milliseconds
  },
  memoryUsed: {
    type: Number  // in MB
  },
  contestId: {
    type: String  // for contest submissions
  },
  rating: {
    type: Number  // for contest submissions
  }
}, {
  timestamps: true
});

// Indexes for faster queries
submissionSchema.index({ submittedAt: 1, platform: 1 });
submissionSchema.index({ userId: 1, platform: 1 });
submissionSchema.index({ userId: 1, status: 1 });
submissionSchema.index({ userId: 1, difficulty: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission; 