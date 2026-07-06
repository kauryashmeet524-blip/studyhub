const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['coding', 'conceptual', 'interview'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  description: {
    type: String,
    default: ''
  },
  youtubeLink: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['unsolved', 'solved', 'revisit'],
    default: 'unsolved'
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);