const Flashcard = require('../models/Flashcard');

const INTERVAL_STEPS = [1, 3, 7, 14, 30];

// Get flashcards due for review today
exports.getDueFlashcards = async (req, res) => {
  try {
    const now = new Date();

    const dueCards = await Flashcard.find({
      userId: req.userId,
      nextReviewDate: { $lte: now }
    }).sort({ nextReviewDate: 1 });

    res.status(200).json(dueCards);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a flashcard
exports.createFlashcard = async (req, res) => {
  try {
    const { noteId, question, answer } = req.body;

    if (!noteId || !question || !answer) {
      return res.status(400).json({ message: 'noteId, question, and answer are required' });
    }

    const flashcard = await Flashcard.create({
      noteId,
      userId: req.userId,
      question,
      answer
    });

    res.status(201).json(flashcard);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Submit a review result (correct/incorrect), reschedule next review
exports.reviewFlashcard = async (req, res) => {
  try {
    const { correct } = req.body;

    const flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.userId });
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    if (correct) {
      const currentIndex = INTERVAL_STEPS.indexOf(flashcard.intervalDays);
      const nextIndex = Math.min(currentIndex + 1, INTERVAL_STEPS.length - 1);
      flashcard.intervalDays = INTERVAL_STEPS[nextIndex === -1 ? 0 : nextIndex];
    } else {
      flashcard.intervalDays = INTERVAL_STEPS[0]; // reset to 1 day
    }

    flashcard.lastReviewed = new Date();
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + flashcard.intervalDays);
    flashcard.nextReviewDate = nextDate;

    await flashcard.save();

    res.status(200).json(flashcard);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a flashcard
exports.deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    res.status(200).json({ message: 'Flashcard deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};