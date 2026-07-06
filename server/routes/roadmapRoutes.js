const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getRoadmap,
  createRoadmapNode,
  toggleComplete,
  updateRoadmapNode,
  deleteRoadmapNode
} = require('../controllers/roadmapController');

router.use(protect);

router.get('/:subjectId', getRoadmap);
router.post('/', createRoadmapNode);
router.put('/:id/complete', toggleComplete);
router.put('/:id', updateRoadmapNode);
router.delete('/:id', deleteRoadmapNode);

module.exports = router;