import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function DsaPage() {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // New question form
  const [form, setForm] = useState({
    title: '', topicId: '', type: 'coding',
    difficulty: 'medium', description: '', youtubeLink: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [qRes, tRes] = await Promise.all([
        API.get('/questions'),
        API.get('/topics')
      ]);
      setQuestions(qRes.data);
      setTopics(tRes.data);
    } catch { setError('Failed to load questions'); }
    finally { setLoading(false); }
  };

  const createQuestion = async () => {
    if (!form.title.trim() || !form.topicId || !form.type) return;
    setSaving(true);
    try {
      const res = await API.post('/questions', form);
      setQuestions([res.data, ...questions]);
      setForm({ title: '', topicId: '', type: 'coding', difficulty: 'medium', description: '', youtubeLink: '' });
      setShowAddForm(false);
    } catch { setError('Failed to create question'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await API.put(`/questions/${id}/status`, { status });
      setQuestions(questions.map(q => q._id === id ? res.data : q));
    } catch { setError('Failed to update status'); }
  };

  const deleteQuestion = async (id) => {
    try {
      await API.delete(`/questions/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
    } catch { setError('Failed to delete question'); }
  };

  // Filter logic
  const filtered = questions.filter(q => {
    if (filterType !== 'all' && q.type !== filterType) return false;
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    if (filterStatus !== 'all' && q.status !== filterStatus) return false;
    return true;
  });

  const totalSolved = questions.filter(q => q.status === 'solved').length;

  const getDiffStyle = (diff) => {
    if (diff === 'easy') return { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' };
    if (diff === 'medium') return { background: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7' };
    return { background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' };
  };

  const getStatusStyle = (status) => {
    if (status === 'solved') return { background: '#e0f2fe', color: '#0284c7' };
    if (status === 'revisit') return { background: '#ffedd5', color: '#ea580c' };
    return { background: '#f3e8ff', color: '#7c3aed' };
  };

  const getTypeLabel = (type) => {
    if (type === 'coding') return '💻 Coding';
    if (type === 'conceptual') return '📖 Conceptual';
    return '🎯 Interview';
  };

  const getTopicName = (topicId) => {
    const topic = topics.find(t => t._id === topicId);
    return topic ? topic.name : 'General';
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6852cc' }}>Loading questions...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>DSA Coding Matrix</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>Track your algorithmic problems, target sheets, and code health logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: '#f5f2fa', border: '1px solid rgba(134, 117, 214, 0.2)', padding: '10px 18px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#6852cc' }}>
              Metrics: {totalSolved} / {questions.length} Mastered
            </span>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} style={actionBtn('#6852cc')}>
            {showAddForm ? '✕ Cancel' : '+ Add Question'}
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem' }}>{error}</div>}

      {/* ADD QUESTION FORM */}
      {showAddForm && (
        <div style={{ background: '#f5f2fa', border: '1px solid rgba(104,82,204,0.2)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ margin: 0, color: '#6852cc', fontWeight: '800' }}>Add New Question</h4>
          <input placeholder="Question title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select value={form.topicId} onChange={e => setForm({ ...form, topicId: e.target.value })} style={inputStyle}>
              <option value="">Select topic</option>
              {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
              <option value="coding">Coding</option>
              <option value="conceptual">Conceptual</option>
              <option value="interview">Interview</option>
            </select>
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} style={inputStyle}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <textarea rows={3} placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
          <input placeholder="YouTube explanation link (optional)" value={form.youtubeLink} onChange={e => setForm({ ...form, youtubeLink: e.target.value })} style={inputStyle} />
          <button onClick={createQuestion} disabled={saving || !form.title || !form.topicId} style={actionBtn('#6852cc')}>
            {saving ? 'Saving...' : 'Save Question'}
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#9ca3af' }}>Filter:</span>
        {['all', 'coding', 'conceptual', 'interview'].map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={{
            padding: '4px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: '600',
            background: filterType === t ? '#6852cc' : '#f3f4f6',
            color: filterType === t ? '#ffffff' : '#4b5563'
          }}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
        <span style={{ width: '1px', height: '20px', background: '#e5e7eb' }} />
        {['all', 'easy', 'medium', 'hard'].map(d => (
          <button key={d} onClick={() => setFilterDifficulty(d)} style={{
            padding: '4px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: '600',
            background: filterDifficulty === d ? '#1f2937' : '#f3f4f6',
            color: filterDifficulty === d ? '#ffffff' : '#4b5563'
          }}>{d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}</button>
        ))}
        <span style={{ width: '1px', height: '20px', background: '#e5e7eb' }} />
        {['all', 'unsolved', 'solved', 'revisit'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '4px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: '600',
            background: filterStatus === s ? '#059669' : '#f3f4f6',
            color: filterStatus === s ? '#ffffff' : '#4b5563'
          }}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      {/* QUESTIONS LIST */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <p>No questions found. Add your first question above.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((q) => (
          <div key={q._id} style={{
            background: '#ffffff', padding: '16px 20px', borderRadius: '12px',
            border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px'
          }}>
            {/* Title + Topic */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: '200px' }}>
              <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '1.05rem' }}>{q.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                📂 {getTopicName(q.topicId)} &nbsp;•&nbsp; {getTypeLabel(q.type)}
              </div>
              {q.description && (
                <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '2px' }}>{q.description}</div>
              )}
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
              <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', ...getDiffStyle(q.difficulty) }}>
                {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
              </span>
              <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', ...getStatusStyle(q.status) }}>
                {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
              {/* Status toggle */}
              <select
                value={q.status}
                onChange={e => updateStatus(q._id, e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.8rem', cursor: 'pointer', color: '#4b5563' }}
              >
                <option value="unsolved">Unsolved</option>
                <option value="solved">Solved</option>
                <option value="revisit">Revisit</option>
              </select>

              {/* YouTube link */}
              {q.youtubeLink && (
                <a href={q.youtubeLink} target="_blank" rel="noreferrer" style={{
                  textDecoration: 'none', fontSize: '0.82rem', fontWeight: '600',
                  padding: '6px 12px', borderRadius: '8px', background: '#fef2f2',
                  color: '#dc2626', border: '1px solid #fee2e2'
                }}>▶ Watch</a>
              )}

              {/* Solve link placeholder */}
              <span style={{
                fontSize: '0.85rem', fontWeight: '600', padding: '8px 14px', borderRadius: '8px',
                background: '#f5f2fa', color: '#8675d6', border: '1px solid rgba(134, 117, 214, 0.15)',
                cursor: 'default'
              }}>Solve ⚡</span>

              {/* Delete */}
              <button onClick={() => deleteQuestion(q._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

const actionBtn = (bg) => ({
  background: bg, color: '#ffffff', border: 'none', borderRadius: '10px',
  padding: '8px 16px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer'
});

const inputStyle = {
  padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb',
  fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit', background: '#ffffff'
};