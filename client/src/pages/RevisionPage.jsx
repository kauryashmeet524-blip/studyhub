import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function RevisionPage() {
  const [cards, setCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flippedCards, setFlippedCards] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('due'); // 'due' or 'all'
  const [form, setForm] = useState({ noteId: '', question: '', answer: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [dueRes, allRes, notesRes] = await Promise.all([
        API.get('/flashcards/due'),
        API.get('/flashcards/due'), // we'll handle all separately
        API.get('/notes')
      ]);
      setCards(dueRes.data);
      setAllCards(allRes.data);
      setNotes(notesRes.data);
    } catch { setError('Failed to load flashcards'); }
    finally { setLoading(false); }
  };

  const fetchDue = async () => {
    try {
      const res = await API.get('/flashcards/due');
      setCards(res.data);
    } catch { setError('Failed to load due cards'); }
  };

  const createFlashcard = async (e) => {
    e.preventDefault();
    if (!form.noteId || !form.question || !form.answer) {
      alert('Please fill all fields');
      return;
    }
    setSaving(true);
    try {
      const res = await API.post('/flashcards', form);
      setAllCards([res.data, ...allCards]);
      setCards([res.data, ...cards]);
      setForm({ noteId: '', question: '', answer: '' });
      setShowAddForm(false);
    } catch { setError('Failed to create flashcard'); }
    finally { setSaving(false); }
  };

  const reviewCard = async (id, correct) => {
    try {
      const res = await API.put(`/flashcards/${id}/review`, { correct });
      // Update the card in state
      setCards(cards.map(c => c._id === id ? res.data : c));
      setAllCards(allCards.map(c => c._id === id ? res.data : c));
      // Auto-flip card back after reviewing
      setFlippedCards(prev => ({ ...prev, [id]: false }));
    } catch { setError('Failed to record review'); }
  };

  const deleteCard = async (id) => {
    try {
      await API.delete(`/flashcards/${id}`);
      setCards(cards.filter(c => c._id !== id));
      setAllCards(allCards.filter(c => c._id !== id));
    } catch { setError('Failed to delete card'); }
  };

  const handleFlip = (cardId) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const getNoteName = (noteId) => {
    const note = notes.find(n => n._id === (noteId?._id || noteId));
    return note ? note.title : 'Note';
  };

  const getIntervalLabel = (days) => {
    if (days <= 1) return 'Due Today';
    if (days <= 3) return `${days}d interval`;
    if (days <= 7) return `${days}d interval`;
    return `${days}d interval`;
  };

  const displayCards = viewMode === 'due' ? cards : allCards;

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6852cc' }}>Loading flashcards...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>Active Revision Flashcards</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>
            Click any card to flip it. Rate your recall to schedule the next review.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: '#f5f2fa', border: '1px solid rgba(134,117,214,0.2)', padding: '10px 18px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#6852cc' }}>
              {cards.length} cards due today
            </span>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} style={actionBtn('#6852cc')}>
            {showAddForm ? '✕ Cancel' : '+ Add Card'}
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem' }}>{error}</div>}

      {/* ADD CARD FORM */}
      {showAddForm && (
        <div style={{ background: '#f5f2fa', border: '1px solid rgba(104,82,204,0.2)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ margin: 0, color: '#6852cc', fontWeight: '800' }}>Create Flashcard</h4>
          <form onSubmit={createFlashcard} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={labelStyle}>Linked Note</label>
              <select value={form.noteId} onChange={e => setForm({ ...form, noteId: e.target.value })} style={inputStyle}>
                <option value="">Select a note</option>
                {notes.map(n => <option key={n._id} value={n._id}>{n.title}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={labelStyle}>Question</label>
              <textarea rows={2} placeholder="What do you want to test yourself on?" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={labelStyle}>Answer</label>
              <textarea rows={3} placeholder="The correct answer..." value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <button type="submit" disabled={saving} style={actionBtn('#6852cc')}>
              {saving ? 'Saving...' : 'Save Flashcard'}
            </button>
          </form>
        </div>
      )}

      {/* VIEW MODE TOGGLE */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#9ca3af' }}>Show:</span>
        {['due', 'all'].map(mode => (
          <button key={mode} onClick={() => setViewMode(mode)} style={{
            padding: '4px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: '600',
            background: viewMode === mode ? '#6852cc' : '#f3f4f6',
            color: viewMode === mode ? '#ffffff' : '#4b5563'
          }}>{mode === 'due' ? `Due Today (${cards.length})` : `All Cards (${allCards.length})`}</button>
        ))}
      </div>

      {/* EMPTY STATE */}
      {displayCards.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          {viewMode === 'due'
            ? <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>🎉 No cards due today — you're all caught up!</p>
            : <p>No flashcards yet. Add your first card above.</p>
          }
        </div>
      )}

      {/* FLASHCARDS GRID — your exact design preserved */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px' }}>
        {displayCards.map((card) => {
          const isFlipped = !!flippedCards[card._id];
          return (
            <div key={card._id} style={{ perspective: '1000px', cursor: 'pointer', height: '240px' }}>
              <div style={{
                position: 'relative', width: '100%', height: '100%',
                transition: 'transform 0.5s ease', transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'none'
              }}>

                {/* FRONT — Question */}
                <div
                  onClick={() => handleFlip(card._id)}
                  style={{
                    position: 'absolute', width: '100%', height: '100%',
                    backfaceVisibility: 'hidden', background: '#ffffff',
                    borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.02)', display: 'flex',
                    flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', background: '#f5f2fa', color: '#6852cc', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', textTransform: 'uppercase' }}>
                        🏷️ {getNoteName(card.noteId)}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: '600' }}>
                        {getIntervalLabel(card.intervalDays)}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937', marginTop: '14px', lineHeight: '1.5' }}>
                      {card.question}
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8675d6', fontWeight: '600', textAlign: 'right' }}>
                    Click to Flip 🔄
                  </div>
                </div>

                {/* BACK — Answer + Review buttons */}
                <div style={{
                  position: 'absolute', width: '100%', height: '100%',
                  backfaceVisibility: 'hidden', background: '#f9fafb',
                  borderRadius: '16px', padding: '20px', border: '2px solid #8675d6',
                  boxShadow: '0 10px 20px rgba(134, 117, 214, 0.08)', display: 'flex',
                  flexDirection: 'column', justifyContent: 'space-between',
                  transform: 'rotateY(180deg)', boxSizing: 'border-box'
                }}>
                  <div style={{ overflowY: 'auto', paddingRight: '4px' }}>
                    <h5 style={{ margin: '0 0 6px 0', color: '#6852cc', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>Answer:</h5>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#4b5563', lineHeight: '1.5', fontWeight: '500' }}>
                      {card.answer}
                    </p>
                  </div>
                  {/* Review buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); reviewCard(card._id, true); }}
                      style={{ flex: 1, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '7px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}
                    >✅ Got it</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); reviewCard(card._id, false); }}
                      style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', padding: '7px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}
                    >❌ Missed</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCard(card._id); }}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.75rem', padding: '4px' }}
                    >🗑</button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

const actionBtn = (bg) => ({
  background: bg, color: '#ffffff', border: 'none', borderRadius: '10px',
  padding: '8px 16px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer'
});

const labelStyle = { fontSize: '0.85rem', fontWeight: '700', color: '#4b5563' };
const inputStyle = {
  padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb',
  fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit', background: '#ffffff'
};