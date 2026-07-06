const mongoose = require('mongoose');

const roadmapNodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  linkedTopicIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  linkedQuestionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('RoadmapNode', roadmapNodeSchema);