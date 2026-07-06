const Note = require('../models/Note');

// Get all notes, optionally filtered by topic
exports.getNotes = async (req, res) => {
  try {
    const { topicId } = req.query;
    const filter = { userId: req.userId };
    if (topicId) filter.topicId = topicId;

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single note by ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a self-made note
exports.createNote = async (req, res) => {
  try {
    const { title, topicId, sourceType, sourceLabel, templateFields } = req.body;

    if (!title || !topicId) {
      return res.status(400).json({ message: 'Title and topicId are required' });
    }

    const note = await Note.create({
      title,
      topicId,
      userId: req.userId,
      sourceType: sourceType || 'self',
      sourceLabel: sourceLabel || '',
      templateFields: templateFields || {}
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};