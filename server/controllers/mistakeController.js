const MistakeLog = require('../models/MistakeLog');

const MASTERY_STREAK = 3;

// Get mistakes with optional filters
exports.getMistakes = async (req, res) => {
  try {
    const { topicTag, type, status } = req.query;
    const filter = { userId: req.userId };
    if (topicTag) filter.topicTag = topicTag;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const mistakes = await MistakeLog.find(filter)
      .sort({ createdAt: -1 })
      .populate('topicTag', 'name')
      .populate('sourceRef');

    res.status(200).json(mistakes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Log a new mistake
exports.createMistake = async (req, res) => {
  try {
    const { topicTag, type, sourceRef, sourceModel, description, whyItWentWrong } = req.body;

    if (!topicTag || !type || !description) {
      return res.status(400).json({ message: 'topicTag, type, and description are required' });
    }

    const mistake = await MistakeLog.create({
      userId: req.userId,
      topicTag,
      type,
      sourceRef,
      sourceModel,
      description,
      whyItWentWrong
    });

    res.status(201).json(mistake);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Record a retry attempt (correct/incorrect)
exports.recordAttempt = async (req, res) => {
  try {
    const { correct } = req.body;
    const mistake = await MistakeLog.findOne({ _id: req.params.id, userId: req.userId });

    if (!mistake) {
      return res.status(404).json({ message: 'Mistake not found' });
    }

    if (mistake.status === 'mastered') {
      return res.status(400).json({ message: 'This mistake is already mastered' });
    }

    if (correct) {
      mistake.correctStreak += 1;
      mistake.status = 'reviewing';
    } else {
      mistake.correctStreak = 0;
      mistake.status = 'reviewing';
    }

    mistake.lastAttemptAt = new Date();
    await mistake.save();

    // Suggest mastery if streak reached
    const suggestMastery = mistake.correctStreak >= MASTERY_STREAK;

    res.status(200).json({ mistake, suggestMastery });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Manually confirm mastered
exports.markMastered = async (req, res) => {
  try {
    const mistake = await MistakeLog.findOne({ _id: req.params.id, userId: req.userId });

    if (!mistake) {
      return res.status(404).json({ message: 'Mistake not found' });
    }

    mistake.status = 'mastered';
    await mistake.save();

    res.status(200).json(mistake);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get next mistake for practice session
exports.getPracticeSession = async (req, res) => {
  try {
    const mistake = await MistakeLog.findOne({
      userId: req.userId,
      status: { $in: ['new', 'reviewing'] }
    })
      .sort({ lastAttemptAt: 1 })
      .populate('topicTag', 'name')
      .populate('sourceRef');

    if (!mistake) {
      return res.status(200).json({ message: 'No mistakes left to practice', mistake: null });
    }

    res.status(200).json(mistake);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a mistake
exports.deleteMistake = async (req, res) => {
  try {
    const mistake = await MistakeLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!mistake) {
      return res.status(404).json({ message: 'Mistake not found' });
    }

    res.status(200).json({ message: 'Mistake deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};