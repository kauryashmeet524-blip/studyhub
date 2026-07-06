const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getDueFlashcards,
  createFlashcard,
  reviewFlashcard,
  deleteFlashcard
} = require('../controllers/flashcardController');

router.use(protect);

router.get('/due', getDueFlashcards);
router.post('/', createFlashcard);
router.put('/:id/review', reviewFlashcard);
router.delete('/:id', deleteFlashcard);

module.exports = router;