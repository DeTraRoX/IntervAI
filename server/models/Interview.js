const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  category: { type: String, default: 'General' },
  codeSnippet: { type: String, default: '' },
  testCases: [{
    input: String,
    expectedOutput: String
  }]
});

const AnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  textAnswer: { type: String, default: '' },
  codeAnswer: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  feedback: {
    score: { type: Number, default: 0 },
    comments: { type: String, default: '' }
  }
});

const InterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Technical', 'Behavioral', 'HR', 'Coding'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  questions: [QuestionSchema],
  answers: [AnswerSchema],
  scores: {
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    overall: { type: Number, default: 0 }
  },
  feedback: {
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }]
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', InterviewSchema);
