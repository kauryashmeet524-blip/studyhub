const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
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
  sourceType: {
    type: String,
    enum: ['self', 'ai', 'channel'],
    required: true
  },
  sourceLabel: {
    type: String,
    default: ''
  },
  templateFields: {
    definition: { type: String, default: '' },
    syntax: { type: String, default: '' },
    example: { type: String, default: '' },
    commonMistakes: { type: String, default: '' }
  },
  sourceBreakdown: {
    definition: { type: String, default: '' },
    syntax: { type: String, default: '' },
    example: { type: String, default: '' },
    commonMistakes: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);