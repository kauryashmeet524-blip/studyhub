import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function MistakesPage() {
  const [logs, setLogs] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentPractice, setCurrentPractice] = useState(null);
  const [masteryPrompt, setMasteryPrompt] = useState(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Form state
  const [form, setForm] = useState({
    topicTag: '', type: 'coding', description: '', whyItWentWrong: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [mRes, tRes] = await Promise.all([
        API.get('/mistakes'),
        API.get('/topics')
      ]);
      setLogs(mRes.data);
      setTopics(tRes.data);
    } catch { setError('Failed to load mistakes'); }
    finally { setLoading(false); }
  };

  const createMistake = async (e) => {
    e.preventDefault();
    if (!form.topicTag || !form.type || !form.description) {
      alert('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const res = await API.post('/mistakes', form);
      setLogs([res.data, ...logs]);
      setForm({ topicTag: '', type: 'coding', description: '', whyItWentWrong: '' });
      setIsModalOpen(false);
    } catch { setError('Failed to log mistake'); }
    finally { setSaving(false); }
  };

  const recordAttempt = async (id, correct) => {
    try {
      const res = await API.put(`/mistakes/${id}/attempt`, { correct });
      const { mistake, suggestMastery } = res.data;
      setLogs(logs.map(l => l._id === id ? mistake : l));
      if (suggestMastery) setMasteryPrompt(id);
    } catch { setError('Failed to record attempt'); }
  };

  const markMastered = async (id) => {
    try {
      const res = await API.put(`/mistakes/${id}/master`);
      setLogs(logs.map(l => l._id === id ? res.data : l));
      setMasteryPrompt(null);
      if (currentPractice?._id === id) loadNextPractice();
    } catch { setError('Failed to mark as mastered'); }
  };

  const loadNextPractice = async () => {
    try {
      const res = await API.get('/mistakes/practice-session');
      setCurrentPractice(res.data.mistake);
      setPracticeMode(true);
    } catch { setError('Failed to load practice session'); }
  };

  const deleteMistake = async (id) => {
    try {
      await API.delete(`/mistakes/${id}`);
      setLogs(logs.filter(l => l._id !== id));
    } catch { setError('Failed to delete mistake'); }
  };

  const getTopicName = (topicTag) => {
    if (!topicTag) return 'General';
    const topic = topics.find(t => t._id === (topicTag._id || topicTag));
    return topic ? topic.name : 'General';
  };

  const filtered = logs.filter(l => {
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (filterType !== 'all' && l.type !== filterType) return false;
    return true;
  });

  const pendingCount = logs.filter(l => l.status !== 'mastered').length;

  const getSeverityStyle = (type) => {
    if (type === 'coding') return { background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5' };
    if (type === 'interview') return { background: '#fef3c7', color: '#d97706', border: '1px solid #fcd34d' };
    return { background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' };
  };

  const getStatusStyle = (status) => {
    if (status === 'mastered') return { background: '#e0f2fe', color: '#0369a1', fontWeight: '700', padding: '6px 12px', borderRadius: '6px', border: 'none' };
    if (status === 'reviewing') return { background: '#f5f2fa', color: '#6852cc', fontWeight: '700', border: '1px solid rgba(104, 82, 204, 0.2)', padding: '6px 12px', borderRadius: '6px' };
    return { background: '#fef3c7', color: '#d97706', fontWeight: '700', border: '1px solid #fcd34d', padding: '6px 12px', borderRadius: '6px' };
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6852cc' }}>Loading mistakes...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>Mistakes Log & Defect Ledger</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>
            {pendingCount} pending mistakes — fix them before your next session.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={loadNextPractice} style={{
            background: '#f59e0b', color: 'white', border: 'none',
            padding: '10px 18px', borderRadius: '10px', fontWeight: '600',
            fontSize: '0.9rem', cursor: 'pointer'
          }}>⚡ Practice Session</button>
          <button onClick={() => setIsModalOpen(true)} style={{
            background: '#ef4444', color: 'white', border: 'none',
            padding: '10px 18px', borderRadius: '10px', fontWeight: '600',
            fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)'
          }}>+ Log New Mistake</button>
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem' }}>{error}</div>}

      {/* MASTERY PROMPT */}
      {masteryPrompt && (
        <div style={{ background: '#f0fdf4', border: '2px solid #10b981', borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontWeight: '800', color: '#059669', fontSize: '1rem' }}>🎉 You've nailed this 3 times in a row!</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#065f46' }}>Mark this mistake as mastered?</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => markMastered(masteryPrompt)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>✅ Mark Mastered</button>
            <button onClick={() => setMasteryPrompt(null)} style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Not yet</button>
          </div>
        </div>
      )}

      {/* PRACTICE SESSION */}
      {practiceMode && currentPractice && (
        <div style={{ background: '#faf9fe', border: '2px solid #6852cc', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#6852cc', fontWeight: '800' }}>⚡ Practice Session</h3>
            <button onClick={() => setPracticeMode(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
          </div>
          <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #6852cc' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{currentPractice.description}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Topic: {getTopicName(currentPractice.topicTag)} • Type: {currentPractice.type} • Streak: {currentPractice.correctStreak}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => recordAttempt(currentPractice._id, true)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', flex: 1 }}>✅ Got it right</button>
            <button onClick={() => recordAttempt(currentPractice._id, false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', flex: 1 }}>❌ Still wrong</button>
            <button onClick={loadNextPractice} style={{ background: '#f3f4f6', color: '#4b5563', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Next →</button>
          </div>
        </div>
      )}

      {practiceMode && !currentPractice && (
        <div style={{ background: '#f0fdf4', border: '1px solid #10b981', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#059669' }}>🎉 No more mistakes to practice! All caught up.</span>
        </div>
      )}

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#9ca3af' }}>Filter:</span>
        {['all', 'new', 'reviewing', 'mastered'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '4px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: '600',
            background: filterStatus === s ? '#6852cc' : '#f3f4f6',
            color: filterStatus === s ? '#ffffff' : '#4b5563'
          }}>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
        <span style={{ width: '1px', height: '20px', background: '#e5e7eb' }} />
        {['all', 'coding', 'conceptual', 'interview'].map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={{
            padding: '4px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: '600',
            background: filterType === t ? '#1f2937' : '#f3f4f6',
            color: filterType === t ? '#ffffff' : '#4b5563'
          }}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* MISTAKES LIST */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <p>No mistakes logged yet. Keep practicing and log your errors here.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filtered.map((log) => (
          <div key={log._id} style={{
            background: '#ffffff', borderRadius: '16px', padding: '24px',
            border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1f2937', margin: '0 0 4px 0' }}>{log.description}</h3>
                <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: '600' }}>
                  📂 {getTopicName(log.topicTag)} • Streak: {log.correctStreak}/3
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', ...getSeverityStyle(log.type) }}>
                  {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                </span>
                <span style={{ ...getStatusStyle(log.status) }}>
                  {log.status === 'mastered' ? '✅ Mastered' : log.status === 'reviewing' ? '🔄 Reviewing' : '⏳ New'}
                </span>
              </div>
            </div>

            {/* Why it went wrong */}
            {log.whyItWentWrong && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #9ca3af' }}>
                  <h5 style={{ margin: '0 0 6px 0', color: '#4b5563', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>Why it went wrong</h5>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', lineHeight: '1.4' }}>{log.whyItWentWrong}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {log.status !== 'mastered' && (
                <>
                  <button onClick={() => recordAttempt(log._id, true)} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem' }}>✅ Got it</button>
                  <button onClick={() => recordAttempt(log._id, false)} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', padding: '6px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem' }}>❌ Still wrong</button>
                  <button onClick={() => markMastered(log._id)} style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '6px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem' }}>⭐ Mark Mastered</button>
                </>
              )}
              <button onClick={() => deleteMistake(log._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', marginLeft: 'auto' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: '800', color: '#1f2937', fontSize: '1.3rem' }}>Log Code Mistake</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>

            <form onSubmit={createMistake} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={labelStyle}>Topic</label>
                <select value={form.topicTag} onChange={e => setForm({ ...form, topicTag: e.target.value })} style={selectStyle}>
                  <option value="">Select a topic</option>
                  {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={labelStyle}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={selectStyle}>
                    <option value="coding">Coding</option>
                    <option value="conceptual">Conceptual</option>
                    <option value="interview">Interview</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={labelStyle}>What went wrong? *</label>
                <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your logic break or bug..." style={textareaStyle} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={labelStyle}>Why did it go wrong?</label>
                <textarea rows="3" value={form.whyItWentWrong} onChange={e => setForm({ ...form, whyItWentWrong: e.target.value })} placeholder="Root cause of the mistake..." style={textareaStyle} />
              </div>

              <button type="submit" disabled={saving} style={{ marginTop: '10px', background: '#6852cc', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>
                {saving ? 'Saving...' : 'Save Log Data ⚡'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const labelStyle = { fontSize: '0.85rem', fontWeight: '700', color: '#4b5563' };
const selectStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', fontSize: '0.9rem' };
const textareaStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', resize: 'none', fontFamily: 'inherit' };