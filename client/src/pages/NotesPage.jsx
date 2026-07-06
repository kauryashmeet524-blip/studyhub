import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function NotesPage() {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [noteForm, setNoteForm] = useState({
    title: '', sourceType: 'self', sourceLabel: '',
    templateFields: { definition: '', syntax: '', example: '', commonMistakes: '' }
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Load topics when subject changes
  useEffect(() => {
    if (selectedSubject) fetchTopics(selectedSubject._id);
    else { setTopics([]); setSelectedTopic(null); setNotes([]); setSelectedNote(null); }
  }, [selectedSubject]);

  // Load notes when topic changes
  useEffect(() => {
    if (selectedTopic) fetchNotes(selectedTopic._id);
    else { setNotes([]); setSelectedNote(null); }
  }, [selectedTopic]);

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/subjects');
      setSubjects(res.data);
      if (res.data.length > 0) setSelectedSubject(res.data[0]);
    } catch { setError('Failed to load subjects'); }
    finally { setLoading(false); }
  };

  const fetchTopics = async (subjectId) => {
    try {
      const res = await API.get(`/topics?subjectId=${subjectId}`);
      setTopics(res.data);
      if (res.data.length > 0) setSelectedTopic(res.data[0]);
      else { setSelectedTopic(null); setNotes([]); setSelectedNote(null); }
    } catch { setError('Failed to load topics'); }
  };

  const fetchNotes = async (topicId) => {
    try {
      const res = await API.get(`/notes?topicId=${topicId}`);
      setNotes(res.data);
      if (res.data.length > 0) setSelectedNote(res.data[0]);
      else setSelectedNote(null);
    } catch { setError('Failed to load notes'); }
  };

  const createSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      const res = await API.post('/subjects', { name: newSubjectName });
      setSubjects([...subjects, res.data]);
      setSelectedSubject(res.data);
      setNewSubjectName('');
      setShowAddSubject(false);
    } catch { setError('Failed to create subject'); }
  };

  const createTopic = async () => {
    if (!newTopicName.trim() || !selectedSubject) return;
    try {
      const res = await API.post('/topics', { name: newTopicName, subjectId: selectedSubject._id });
      setTopics([...topics, res.data]);
      setSelectedTopic(res.data);
      setNewTopicName('');
      setShowAddTopic(false);
    } catch { setError('Failed to create topic'); }
  };

  const createNote = async () => {
    if (!noteForm.title.trim() || !selectedTopic) return;
    setSaving(true);
    try {
      const res = await API.post('/notes', { ...noteForm, topicId: selectedTopic._id });
      setNotes([res.data, ...notes]);
      setSelectedNote(res.data);
      setNoteForm({ title: '', sourceType: 'self', sourceLabel: '', templateFields: { definition: '', syntax: '', example: '', commonMistakes: '' } });
      setShowAddNote(false);
    } catch { setError('Failed to save note'); }
    finally { setSaving(false); }
  };

  const deleteNote = async (noteId) => {
    try {
      await API.delete(`/notes/${noteId}`);
      const remaining = notes.filter(n => n._id !== noteId);
      setNotes(remaining);
      setSelectedNote(remaining.length > 0 ? remaining[0] : null);
    } catch { setError('Failed to delete note'); }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6852cc' }}>Loading notes...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>Notes Hub & Quick-Sheets</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>Click any topic card to open its detailed sheet below.</p>
        </div>
        <button onClick={() => setShowAddNote(!showAddNote)} style={actionBtn('#6852cc')}>
          {showAddNote ? '✕ Cancel' : '+ Add Note'}
        </button>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem' }}>{error}</div>}

      {/* SUBJECT + TOPIC SELECTORS */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Subjects */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {subjects.map(s => (
            <button key={s._id} onClick={() => setSelectedSubject(s)} style={{
              padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700',
              background: selectedSubject?._id === s._id ? '#6852cc' : '#f5f2fa',
              color: selectedSubject?._id === s._id ? '#ffffff' : '#6852cc'
            }}>{s.name}</button>
          ))}
          {showAddSubject ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <input value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="Subject name" style={inputStyle} onKeyDown={e => e.key === 'Enter' && createSubject()} autoFocus />
              <button onClick={createSubject} style={actionBtn('#6852cc')}>Add</button>
            </div>
          ) : (
            <button onClick={() => setShowAddSubject(true)} style={actionBtn('#8675d6')}>+ Subject</button>
          )}
        </div>
      </div>

      {/* TOPIC PILLS */}
      {selectedSubject && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '600' }}>Topic:</span>
          {topics.map(t => (
            <button key={t._id} onClick={() => setSelectedTopic(t)} style={{
              padding: '4px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600',
              background: selectedTopic?._id === t._id ? '#1f2937' : '#f3f4f6',
              color: selectedTopic?._id === t._id ? '#ffffff' : '#4b5563'
            }}>{t.name}</button>
          ))}
          {showAddTopic ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <input value={newTopicName} onChange={e => setNewTopicName(e.target.value)} placeholder="Topic name" style={inputStyle} onKeyDown={e => e.key === 'Enter' && createTopic()} autoFocus />
              <button onClick={createTopic} style={actionBtn('#1f2937')}>Add</button>
            </div>
          ) : (
            <button onClick={() => setShowAddTopic(true)} style={actionBtn('#4b5563')}>+ Topic</button>
          )}
        </div>
      )}

      {/* ADD NOTE FORM */}
      {showAddNote && (
        <div style={{ background: '#f5f2fa', border: '1px solid rgba(104,82,204,0.2)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ margin: 0, color: '#6852cc', fontWeight: '800' }}>New Note {selectedTopic ? `→ ${selectedTopic.name}` : '(select a topic first)'}</h4>
          <input placeholder="Note title" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} style={inputStyle} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select value={noteForm.sourceType} onChange={e => setNoteForm({ ...noteForm, sourceType: e.target.value })} style={inputStyle}>
              <option value="self">Self-made</option>
              <option value="channel">Channel/Source</option>
            </select>
            <input placeholder="Source label (e.g. GFG, Apna College)" value={noteForm.sourceLabel} onChange={e => setNoteForm({ ...noteForm, sourceLabel: e.target.value })} style={inputStyle} />
          </div>
          <textarea rows={3} placeholder="Definition — what is this concept?" value={noteForm.templateFields.definition} onChange={e => setNoteForm({ ...noteForm, templateFields: { ...noteForm.templateFields, definition: e.target.value } })} style={{ ...inputStyle, resize: 'vertical' }} />
          <textarea rows={3} placeholder="Syntax / Code" value={noteForm.templateFields.syntax} onChange={e => setNoteForm({ ...noteForm, templateFields: { ...noteForm.templateFields, syntax: e.target.value } })} style={{ ...inputStyle, fontFamily: 'monospace', resize: 'vertical' }} />
          <textarea rows={3} placeholder="Example" value={noteForm.templateFields.example} onChange={e => setNoteForm({ ...noteForm, templateFields: { ...noteForm.templateFields, example: e.target.value } })} style={{ ...inputStyle, fontFamily: 'monospace', resize: 'vertical' }} />
          <textarea rows={2} placeholder="Common Mistakes" value={noteForm.templateFields.commonMistakes} onChange={e => setNoteForm({ ...noteForm, templateFields: { ...noteForm.templateFields, commonMistakes: e.target.value } })} style={{ ...inputStyle, resize: 'vertical' }} />
          <button onClick={createNote} disabled={saving || !selectedTopic} style={actionBtn('#6852cc')}>
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      )}

      {/* NOTES GRID */}
      {notes.length === 0 && !showAddNote && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <p style={{ fontSize: '1rem' }}>No notes yet in this topic.</p>
          <button onClick={() => setShowAddNote(true)} style={actionBtn('#6852cc')}>+ Add your first note</button>
        </div>
      )}

      {notes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {notes.map((note) => {
            const isCurrent = selectedNote?._id === note._id;
            return (
              <div key={note._id} onClick={() => setSelectedNote(note)} style={{
                background: '#ffffff', borderRadius: '14px', padding: '16px',
                border: isCurrent ? '2px solid #6852cc' : '1px solid #e5e7eb',
                boxShadow: isCurrent ? '0 10px 15px -3px rgba(104, 82, 204, 0.1)' : '0 2px 4px rgba(0,0,0,0.01)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                cursor: 'pointer', transition: 'all 0.2s ease',
                transform: isCurrent ? 'translateY(-2px)' : 'none'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', background: '#f5f2fa', color: '#6852cc', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                    {note.sourceLabel || note.sourceType}
                  </span>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1f2937', margin: '10px 0 4px 0' }}>{note.title}</h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{isCurrent ? '⚡ Reading Now' : 'Click to View →'}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteNote(note._id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SELECTED NOTE DETAIL PANEL */}
      {selectedNote && (
        <div style={{ background: '#faf9fe', border: '1px solid rgba(104, 82, 204, 0.15)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '2px solid #efeaf8', paddingBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', background: '#6852cc', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', textTransform: 'uppercase' }}>
              {selectedNote.sourceLabel || selectedNote.sourceType}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1f2937', marginTop: '8px', marginBottom: '4px' }}>
              {selectedNote.title} — Detailed Sheet
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Definition */}
            {selectedNote.templateFields?.definition && (
              <div style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', background: '#ffffff' }}>
                <h5 style={{ margin: '0 0 6px 0', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem' }}>1. Core Theory Definition</h5>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#374151', lineHeight: '1.5' }}>{selectedNote.templateFields.definition}</p>
              </div>
            )}
            {/* Syntax */}
            {selectedNote.templateFields?.syntax && (
              <div style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #4b5563', background: '#1f2937' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem' }}>2. Code Setup / Declaration Syntax</h5>
                <pre style={{ margin: 0, color: '#f3f4f6', fontFamily: 'monospace', fontSize: '0.85rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{selectedNote.templateFields.syntax}</pre>
              </div>
            )}
            {/* Example */}
            {selectedNote.templateFields?.example && (
              <div style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10b981', background: '#ffffff' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#059669', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem' }}>3. Practical Application Snippet</h5>
                <pre style={{ margin: 0, color: '#111827', fontFamily: 'monospace', fontSize: '0.85rem', overflowX: 'auto', whiteSpace: 'pre-wrap', background: '#f0fdf4', padding: '12px', borderRadius: '6px' }}>{selectedNote.templateFields.example}</pre>
              </div>
            )}
            {/* Common Mistakes */}
            {selectedNote.templateFields?.commonMistakes && (
              <div style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ef4444', background: '#fef2f2' }}>
                <h5 style={{ margin: '0 0 6px 0', color: '#dc2626', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem' }}>4. Critical Pitfalls & Mistakes Logged</h5>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#991b1b', lineHeight: '1.5', fontWeight: '500' }}>{selectedNote.templateFields.commonMistakes}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Shared style helpers
const actionBtn = (bg) => ({
  background: bg, color: '#ffffff', border: 'none', borderRadius: '10px',
  padding: '8px 16px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer'
});

const inputStyle = {
  padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb',
  fontSize: '0.88rem', outline: 'none', width: '100%', boxSizing: 'border-box',
  fontFamily: 'inherit'
};