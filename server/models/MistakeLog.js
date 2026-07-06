const mongoose = require('mongoose');

const mistakeLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topicTag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  type: {
    type: String,
    enum: ['coding', 'conceptual', 'interview'],
    required: true
  },
  sourceRef: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sourceModel'
  },
  sourceModel: {
    type: String,
    enum: ['Question', 'Note']
  },
  description: {
    type: String,
    required: true
  },
  whyItWentWrong: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['new', 'reviewing', 'mastered'],
    default: 'new'
  },
  correctStreak: {
    type: Number,
    default: 0
  },
  lastAttemptAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('MistakeLog', mistakeLogSchema);