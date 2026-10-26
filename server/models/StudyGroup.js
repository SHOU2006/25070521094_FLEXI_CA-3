const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    subject: {
      type: String,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    inviteCode: {
      type: String,
      unique: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    announcements: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    maxMembers: {
      type: Number,
      default: 20,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Generate unique invite code before saving
studyGroupSchema.pre('save', function () {
  if (!this.inviteCode) {
    this.inviteCode =
      Math.random().toString(36).substring(2, 8).toUpperCase() +
      Math.random().toString(36).substring(2, 4).toUpperCase();
  }
});

module.exports = mongoose.model('StudyGroup', studyGroupSchema);
