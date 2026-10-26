const mongoose = require('mongoose');

const studyGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [200, 'Goal title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['academic', 'skill', 'personal', 'career', 'other'],
      default: 'academic',
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'abandoned'],
      default: 'active',
    },
    milestones: [
      {
        title: String,
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
    ],
    linkedSubject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyGoal', studyGoalSchema);
