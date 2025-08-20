import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function OrderPipeline() {
    const [pipelineId, setPipelineId] = useState(null);
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get('/api/pipelines');
                const active = (res.data.pipelines || []).filter(p => p.isActive);
                if (active.length === 0) {
                    setInitializing(false);
                    return;
                }
                const first = active[0];
                setPipelineId(first.id);
                await loadProgress(first.id);
            } catch (e) {
                toast.error('Failed to load pipelines');
            } finally {
                setInitializing(false);
            }
        })();
    }, []);

    const loadProgress = async (id) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/pipelines/${id}/progress`);
            setStages(res.data.stages || []);
        } catch (e) {
            toast.error('Failed to load progress');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 style={{ color: '#1e293b', marginBottom: '1rem' }}>My Order</h1>
            <div className="card">
                {initializing ? (
                    <div>Loading...</div>
                ) : pipelineId ? (
                    <>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <div className="pipeline-vertical">
                                {stages.map((s, idx) => (
                                    <div key={idx} className="pipeline-item">
                                        <div className="pipeline-marker">
                                            <div className={`pipeline-dot ${s.completed ? 'completed' : 'pending'}`} />
                                            {idx < stages.length - 1 && (
                                                <div className={`pipeline-line ${stages[idx + 1].completed && s.completed ? 'completed' : ''}`} />
                                            )}
                                        </div>
                                        <div className={`pipeline-card ${s.completed ? 'completed' : ''}`}>
                                            <div className="pipeline-title">{s.name}</div>
                                            <div className={`badge ${s.completed ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                                                {s.completed ? 'Completed' : 'Pending'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div>No pipeline available.</div>
                )}
            </div>
        </div>
    );
}


