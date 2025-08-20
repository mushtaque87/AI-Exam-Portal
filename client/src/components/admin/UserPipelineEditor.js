import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function UserPipelineEditor({ userId }) {
    const [pipelines, setPipelines] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get('/api/pipelines');
                setPipelines(res.data.pipelines || []);
            } catch (e) {
                toast.error('Failed to load pipelines');
            }
        })();
    }, []);

    const loadProgress = async (id) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/pipelines/${id}/users/${userId}/progress`);
            setStages(res.data.stages || []);
        } catch (e) {
            toast.error('Failed to load progress');
        } finally {
            setLoading(false);
        }
    };

    const toggleStage = async (index) => {
        try {
            const nextCompleted = !stages[index].completed;
            await axios.post(`/api/pipelines/${selectedId}/users/${userId}/progress`, {
                stageIndex: index,
                completed: nextCompleted
            });
            const next = [...stages];
            next[index] = { ...next[index], completed: nextCompleted };
            setStages(next);
        } catch (e) {
            toast.error('Failed to update stage');
        }
    };

    return (
        <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>User Pipeline Editor</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <select className="input" value={selectedId || ''} onChange={(e) => { const id = Number(e.target.value); setSelectedId(id); if (id) loadProgress(id); }}>
                    <option value="">Select a pipeline</option>
                    {pipelines.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
            {selectedId && (
                <div>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="pipeline-vertical">
                            {stages.map((s, idx) => (
                                <div key={idx} className="pipeline-item">
                                    <div className="pipeline-marker">
                                        <div className={`pipeline-dot ${s.completed ? 'completed' : 'pending'}`} />
                                        {idx < stages.length - 1 && <div className={`pipeline-line ${stages[idx + 1].completed && s.completed ? 'completed' : ''}`} />}
                                    </div>
                                    <div className={`pipeline-card ${s.completed ? 'completed' : ''}`}>
                                        <span className="pipeline-title" style={{ marginRight: '1rem' }}>{s.name}</span>
                                        <input
                                            type="checkbox"
                                            checked={!!s.completed}
                                            onChange={() => toggleStage(idx)}
                                            aria-label={`Mark ${s.name} ${s.completed ? 'incomplete' : 'complete'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


