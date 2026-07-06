import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    subjects: 0,
    solvedQuestions: 0,
    totalQuestions: 0,
    pendingMistakes: 0,
    dueFlashcards: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [subjectsRes, questionsRes, mistakesRes, flashcardsRes] = await Promise.all([
          API.get('/subjects'),
          API.get('/questions'),
          API.get('/mistakes?status=new&status=reviewing'),
          API.get('/flashcards/due')
        ]);

        const solved = questionsRes.data.filter(q => q.status === 'solved').length;
        const pending = mistakesRes.data.filter(m => m.status !== 'mastered').length;

        setStats({
          subjects: subjectsRes.data.length,
          solvedQuestions: solved,
          totalQuestions: questionsRes.data.length,
          pendingMistakes: pending,
          dueFlashcards: flashcardsRes.data.length
        });
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const metrics = [
    { label: 'Subjects', value: loading ? '...' : `${stats.subjects} Active`, color: '#3b82f6', desc: 'Your study subjects' },
    { label: 'DSA Solved', value: loading ? '...' : `${stats.solvedQuestions} / ${stats.totalQuestions}`, color: '#10b981', desc: 'Questions solved' },
    { label: 'Mistakes Pending', value: loading ? '...' : `${stats.pendingMistakes} Pending`, color: '#f59e0b', desc: 'Requires active retry' },
    { label: 'Cards Due Today', value: loading ? '...' : `${stats.dueFlashcards} Cards`, color: '#8675d6', desc: 'Flashcards to review' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* HERO BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #8675d6 0%, #6852cc 100%)', padding: '32px', borderRadius: '16px', color: '#ffffff', boxShadow: '0 4px 12px rgba(134, 117, 214, 0.15)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0' }}>
          Welcome back, {user?.name}! 👋
        </h1>
        <p style={{ opacity: '0.9', fontSize: '0.95rem', margin: '0' }}>
          Your personal learning hub. Track your progress, revise systematically, and fix your mistakes.
        </p>
      </div>

      {/* REAL STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {metrics.map((item, index) => (
          <div key={index} style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid rgba(243, 244, 246, 0.8)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#9ca3af' }}>
              {item.label}
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: item.color, margin: '6px 0' }}>
              {item.value}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0' }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(243, 244, 246, 0.8)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/notes" style={btnStyle}>📝 Review Notes</Link>
          <Link to="/dsa" style={btnStyle}>💻 Practice DSA</Link>
          <Link to="/revision" style={btnStyle}>🃏 Revision Cards</Link>
          <Link to="/mistakes" style={{ ...btnStyle, background: '#fef3c7', color: '#d97706' }}>⚠️ Review Mistakes</Link>
        </div>
      </div>

    </div>
  );
}

const btnStyle = {
  textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600',
  padding: '10px 18px', borderRadius: '10px', background: '#f5f2fa',
  color: '#8675d6', transition: 'all 0.2s', border: '1px solid rgba(134, 117, 214, 0.1)'
};