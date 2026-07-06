const Topic = require('../models/Topic');

// Get all topics for a subject
exports.getTopics = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const filter = { userId: req.userId };
    if (subjectId) filter.subjectId = subjectId;

    const topics = await Topic.find(filter).sort({ order: 1, createdAt: 1 });
    res.status(200).json(topics);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new topic
exports.createTopic = async (req, res) => {
  try {
    const { name, subjectId, order } = req.body;

    if (!name || !subjectId) {
      return res.status(400).json({ message: 'Topic name and subjectId are required' });
    }

    const topic = await Topic.create({
      name,
      subjectId,
      userId: req.userId,
      order: order || 0
    });

    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a topic
exports.updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    res.status(200).json(topic);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a topic
exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};