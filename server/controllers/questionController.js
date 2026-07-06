const Question = require('../models/Question');

// Get questions, with optional filters
exports.getQuestions = async (req, res) => {
  try {
    const { topicId, type, status, difficulty } = req.query;
    const filter = { userId: req.userId };
    if (topicId) filter.topicId = topicId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a question
exports.createQuestion = async (req, res) => {
  try {
    const { title, topicId, type, difficulty, description, youtubeLink } = req.body;

    if (!title || !topicId || !type) {
      return res.status(400).json({ message: 'Title, topicId, and type are required' });
    }

    const question = await Question.create({
      title,
      topicId,
      userId: req.userId,
      type,
      difficulty,
      description,
      youtubeLink
    });

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update status (solved/unsolved/revisit)
exports.updateQuestionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['unsolved', 'solved', 'revisit'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a question (full edit)
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};