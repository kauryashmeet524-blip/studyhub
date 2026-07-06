const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  lastReviewed: {
    type: Date,
    default: null
  },
  nextReviewDate: {
    type: Date,
    default: () => new Date()
  },
  intervalDays: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);