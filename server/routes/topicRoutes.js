const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic
} = require('../controllers/topicController');

router.use(protect);

router.get('/', getTopics);
router.post('/', createTopic);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

module.exports = router;