import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function RoadmapPage() {
  const [nodes, setNodes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', subjectId: '', order: 0, linkedTopicIds: []
  });

  useEffect(() => {
    fetchSubjectsAndTopics();
  }, []);

  useEffect(() => {
    if (selectedSubject) fetchRoadmap(selectedSubject._id);
  }, [selectedSubject]);

  const fetchSubjectsAndTopics = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        API.get('/subjects'),
        API.get('/topics')
      ]);
      setSubjects(sRes.data);
      setTopics(tRes.data);
      if (sRes.data.length > 0) setSelectedSubject(sRes.data[0]);
    } catch { setError('Failed to load subjects'); }
    finally { setLoading(false); }
  };

  const fetchRoadmap = async (subjectId) => {
    try {
      const res = await API.get(`/roadmap/${subjectId}`);
      setNodes(res.data);
    } catch { setError('Failed to load roadmap'); }
  };

  const createNode = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.subjectId) return;
    setSaving(true);
    try {
      const res = await API.post('/roadmap', {
        ...form,
        subjectId: selectedSubject._id,
        order: nodes.length
      });
      setNodes([...nodes, res.data]);
      setForm({ title: '', subjectId: '', order: 0, linkedTopicIds: [] });
      setShowAddForm(false);
    } catch { setError('Failed to create roadmap node'); }
    finally { setSaving(false); }
  };

  const toggleComplete = async (nodeId) => {
    try {
      const res = await API.put(`/roadmap/${nodeId}/complete`);
      setNodes(nodes.map(n => n._id === nodeId ? res.data : n));
    } catch { setError('Failed to update node'); }
  };

  const deleteNode = async (nodeId) => {
    try {
      await API.delete(`/roadmap/${nodeId}`);
      setNodes(nodes.filter(n => n._id !== nodeId));
    } catch { setError('Failed to delete node'); }
  };

  const getTopicsForSubject = () => {
    if (!selectedSubject) return [];
    return topics.filter(t => t.subjectId === selectedSubject._id);
  };

  const getTopicName = (topicId) => {
    const topic = topics.find(t => t._id === (topicId?._id || topicId));
    return topic ? topic.name : topicId;
  };

  const totalNodes = nodes.length;
  const completedNodes = nodes.filter(n => n.completed).length;
  const overallPct = totalNodes === 0 ? 0 : Math.round((completedNodes / totalNodes) * 100);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6852cc' }}>Loading roadmap...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>Engineering Preparation Roadmap</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>Track your milestone progress. Check nodes to mark them complete.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {totalNodes > 0 && (
            <div style={{ background: '#f5f2fa', border: '1px solid rgba(134,117,214,0.2)', padding: '10px 18px', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#6852cc' }}>
                Overall: {overallPct}% Complete
              </span>
            </div>
          )}
          <button onClick={() => setShowAddForm(!showAddForm)} style={actionBtn('#6852cc')}>
            {showAddForm ? '✕ Cancel' : '+ Add Node'}
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem' }}>{error}</div>}

      {/* SUBJECT SELECTOR */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#9ca3af' }}>Subject:</span>
        {subjects.map(s => (
          <button key={s._id} onClick={() => setSelectedSubject(s)} style={{
            padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: '700',
            background: selectedSubject?._id === s._id ? '#6852cc' : '#f5f2fa',
            color: selectedSubject?._id === s._id ? '#ffffff' : '#6852cc'
          }}>{s.name}</button>
        ))}
      </div>

      {/* ADD NODE FORM */}
      {showAddForm && (
        <div style={{ background: '#f5f2fa', border: '1px solid rgba(104,82,204,0.2)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ margin: 0, color: '#6852cc', fontWeight: '800' }}>
            Add Roadmap Node {selectedSubject ? `— ${selectedSubject.name}` : ''}
          </h4>
          <form onSubmit={createNode} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              placeholder="Node title (e.g. Master OOP Concepts)"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
              required
            />
            {/* Link topics (multi-select) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Link Topics (optional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {getTopicsForSubject().map(t => {
                  const linked = form.linkedTopicIds.includes(t._id);
                  return (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          linkedTopicIds: linked
                            ? prev.linkedTopicIds.filter(id => id !== t._id)
                            : [...prev.linkedTopicIds, t._id]
                        }));
                      }}
                      style={{
                        padding: '4px 12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        fontSize: '0.78rem', fontWeight: '600',
                        background: linked ? '#6852cc' : '#e5e7eb',
                        color: linked ? '#ffffff' : '#4b5563'
                      }}
                    >{t.name}</button>
                  );
                })}
                {getTopicsForSubject().length === 0 && (
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No topics yet for this subject</span>
                )}
              </div>
            </div>
            <button type="submit" disabled={saving || !selectedSubject} style={actionBtn('#6852cc')}>
              {saving ? 'Saving...' : 'Save Node'}
            </button>
          </form>
        </div>
      )}

      {/* EMPTY STATE */}
      {nodes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <p style={{ fontSize: '1rem' }}>No roadmap nodes yet for {selectedSubject?.name}.</p>
          <button onClick={() => setShowAddForm(true)} style={actionBtn('#6852cc')}>+ Add your first node</button>
        </div>
      )}

      {/* ROADMAP NODES — your exact design preserved */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
        {nodes.map((node, index) => {
          const linkedTopics = node.linkedTopicIds || [];
          const pct = node.completed ? 100 : 0;

          return (
            <div key={node._id} style={{
              background: '#ffffff', borderRadius: '16px', padding: '24px',
              border: node.completed ? '1px solid #d1fae5' : '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
              display: 'flex', flexDirection: 'column', gap: '16px',
              opacity: node.completed ? 0.85 : 1
            }}>

              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6852cc', background: '#f5f2fa', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                    Step {index + 1}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1f2937', marginTop: '6px', marginBottom: '2px' }}>
                    {node.title}
                  </h3>
                  {linkedTopics.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {linkedTopics.map(tId => (
                        <span key={tId?._id || tId} style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                          📎 {tId?.name || getTopicName(tId)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', background: '#faf9fe', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(104, 82, 204, 0.1)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4b5563' }}>PROGRESS</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#6852cc' }}>{pct}% Done</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6852cc, #8675d6)', transition: 'width 0.3s ease' }} />
              </div>

              {/* Completion Checkbox */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '10px',
                background: node.completed ? '#f9fafb' : '#ffffff',
                border: node.completed ? '1px solid #d1fae5' : '1px solid #e5e7eb',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}>
                <input
                  type="checkbox"
                  checked={node.completed}
                  onChange={() => toggleComplete(node._id)}
                  style={{ width: '18px', height: '18px', accentColor: '#6852cc', cursor: 'pointer' }}
                />
                <span style={{
                  fontSize: '0.92rem', fontWeight: '500',
                  color: node.completed ? '#9ca3af' : '#374151',
                  textDecoration: node.completed ? 'line-through' : 'none'
                }}>
                  {node.completed ? '✅ Completed' : 'Mark this node as complete'}
                </span>
              </label>

              {/* Delete */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => deleteNode(node._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                  Delete Node
                </button>
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