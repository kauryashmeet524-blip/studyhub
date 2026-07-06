const RoadmapNode = require('../models/RoadmapNode');

// Get all roadmap nodes for a subject, in order
exports.getRoadmap = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const nodes = await RoadmapNode.find({ subjectId, userId: req.userId })
      .sort({ order: 1 })
      .populate('linkedTopicIds', 'name')
      .populate('linkedQuestionIds', 'title');

    res.status(200).json(nodes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a roadmap node
exports.createRoadmapNode = async (req, res) => {
  try {
    const { title, subjectId, order, linkedTopicIds, linkedQuestionIds } = req.body;

    if (!title || !subjectId) {
      return res.status(400).json({ message: 'Title and subjectId are required' });
    }

    const node = await RoadmapNode.create({
      title,
      subjectId,
      userId: req.userId,
      order: order || 0,
      linkedTopicIds: linkedTopicIds || [],
      linkedQuestionIds: linkedQuestionIds || []
    });

    res.status(201).json(node);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark a node complete/incomplete
exports.toggleComplete = async (req, res) => {
  try {
    const node = await RoadmapNode.findOne({ _id: req.params.id, userId: req.userId });

    if (!node) {
      return res.status(404).json({ message: 'Roadmap node not found' });
    }

    node.completed = !node.completed;
    await node.save();

    res.status(200).json(node);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a node (edit title, links, order)
exports.updateRoadmapNode = async (req, res) => {
  try {
    const node = await RoadmapNode.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!node) {
      return res.status(404).json({ message: 'Roadmap node not found' });
    }

    res.status(200).json(node);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a node
exports.deleteRoadmapNode = async (req, res) => {
  try {
    const node = await RoadmapNode.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!node) {
      return res.status(404).json({ message: 'Roadmap node not found' });
    }

    res.status(200).json({ message: 'Roadmap node deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};