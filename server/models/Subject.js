const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      trim: true,
      maxlength: [20, 'Subject code cannot exceed 20 characters'],
    },
    color: {
      type: String,
      default: '#6C63FF', // default purple
    },
    icon: {
      type: String,
      default: '📚',
    },
    professor: {
      type: String,
      trim: true,
    },
    credits: {
      type: Number,
      min: 0,
      max: 10,
      default: 3,
    },
    // GPA tracker
    grades: [
      {
        assessmentName: String,
        score: Number,
        totalScore: Number,
        weight: Number, // percentage weight
        date: Date,
      },
    ],
    targetGPA: { type: Number, default: 9.0, min: 0, max: 10 },
    currentGPA: { type: Number, default: 0 },
    // Notes
    notes: [
      {
        title: String,
        content: String,
        attachments: [
          {
            filename: String,
            path: String,
            mimetype: String,
            size: Number,
          },
        ],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Calculate current GPA before saving
subjectSchema.methods.calculateGPA = function () {
  if (!this.grades || this.grades.length === 0) return 0;
  let totalWeight = 0;
  let weightedScore = 0;
  this.grades.forEach((g) => {
    if (g.score !== undefined && g.totalScore && g.weight) {
      const percentage = (g.score / g.totalScore) * 10;
      weightedScore += percentage * g.weight;
      totalWeight += g.weight;
    }
  });
  return totalWeight > 0 ? (weightedScore / totalWeight).toFixed(2) : 0;
};

module.exports = mongoose.model('Subject', subjectSchema);
