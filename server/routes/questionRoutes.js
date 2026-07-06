const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getQuestions,
  createQuestion,
  updateQuestionStatus,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

router.use(protect);

router.get('/', getQuestions);
router.post('/', createQuestion);
router.put('/:id/status', updateQuestionStatus);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;