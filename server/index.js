require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const topicRoutes = require('./routes/topicRoutes');
const noteRoutes = require('./routes/noteRoutes');
const questionRoutes = require('./routes/questionRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const mistakeRoutes = require('./routes/mistakeRoutes');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('StudyHub server is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/mistakes', mistakeRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});