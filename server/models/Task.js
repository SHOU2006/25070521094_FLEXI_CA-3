const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      enum: ['assignment', 'exam', 'project', 'quiz', 'reading', 'other'],
      default: 'assignment',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'completed', 'overdue'],
      default: 'todo',
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    estimatedHours: {
      type: Number,
      min: 0,
      max: 100,
      default: 1,
    },
    actualHours: {
      type: Number,
      min: 0,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    // Attachments
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    // Checklist / subtasks
    checklist: [
      {
        item: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    tags: [String],
    reminder: {
      enabled: { type: Boolean, default: false },
      reminderDate: { type: Date, default: null },
      reminderSent: { type: Boolean, default: false },
    },
    // Study group link
    studyGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyGroup',
      default: null,
    },
    isShared: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-update status to overdue
taskSchema.pre('save', function () {
  if (
    this.status !== 'completed' &&
    this.deadline &&
    new Date() > this.deadline
  ) {
    this.status = 'overdue';
  }
});

// Virtual for days remaining
taskSchema.virtual('daysRemaining').get(function () {
  if (!this.deadline) return null;
  const diff = this.deadline - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
