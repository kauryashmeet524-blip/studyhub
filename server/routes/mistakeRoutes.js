const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getMistakes,
  createMistake,
  recordAttempt,
  markMastered,
  getPracticeSession,
  deleteMistake
} = require('../controllers/mistakeController');

router.use(protect);

router.get('/', getMistakes);
router.get('/practice-session', getPracticeSession);
router.post('/', createMistake);
router.put('/:id/attempt', recordAttempt);
router.put('/:id/master', markMastered);
router.delete('/:id', deleteMistake);

module.exports = router;