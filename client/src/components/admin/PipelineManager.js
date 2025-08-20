import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const stageColors = {
    completed: '#10b981',
    pending: '#d1d5db'
};

export default function PipelineManager() {
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [stages, setStages] = useState(['Order Placed', 'Packed', 'Shipped', 'Delivered']);

    useEffect(() => {
        loadPipelines();
    }, []);

    const loadPipelines = async () => {
        try {
            const res = await axios.get('/api/pipelines');
            setPipelines(res.data.pipelines || []);
        } catch (e) {
            toast.error('Failed to load pipelines');
        } finally {
            setLoading(false);
        }
    };

    const addStage = () => {
        if (stages.length >= 10) return toast.warn('Maximum 10 stages');
        setStages([...stages, `Stage ${stages.length + 1}`]);
    };

    const removeStage = (idx) => {
        if (stages.length <= 1) return;
        setStages(stages.filter((_, i) => i !== idx));
    };

    const updateStage = (idx, value) => {
        const next = [...stages];
        next[idx] = value;
        setStages(next);
    };

    const createPipeline = async () => {
        try {
            await axios.post('/api/pipelines', { name, stages });
            toast.success('Pipeline created');
            setName('');
            setStages(['Order Placed', 'Packed', 'Shipped', 'Delivered']);
            loadPipelines();
        } catch (e) {
            const message = e.response?.data?.message || 'Failed to create pipeline';
            toast.error(message);
        }
    };

    const deletePipeline = async (id) => {
        if (!window.confirm('Delete this pipeline?')) return;
        try {
            await axios.delete(`/api/pipelines/${id}`);
            toast.success('Pipeline deleted');
            loadPipelines();
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div>
            <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Pipelines</h2>

            <div className="card" style={{ marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Create Pipeline</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Pipeline Name (e.g., My Order)"
                        className="input"
                    />
                    <div>
                        {stages.map((s, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    value={s}
                                    onChange={(e) => updateStage(idx, e.target.value)}
                                    className="input"
                                    placeholder={`Stage ${idx + 1}`}
                                />
                                <button className="btn btn-outline" onClick={() => removeStage(idx)}>Remove</button>
                            </div>
                        ))}
                        <button className="btn btn-outline" onClick={addStage}>Add Stage</button>
                    </div>
                    <button className="btn btn-primary" onClick={createPipeline} disabled={!name || stages.some(s => !s.trim())}>Create</button>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Existing Pipelines</h3>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {pipelines.map(p => (
                            <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                    <button className="btn btn-outline" onClick={() => deletePipeline(p.id)}>Delete</button>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {p.stages.map((s, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '9999px', background: stageColors.pending }} />
                                            <span style={{ color: '#374151' }}>{s}</span>
                                            {idx < p.stages.length - 1 && <div style={{ width: 24, height: 2, background: '#e5e7eb' }} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


