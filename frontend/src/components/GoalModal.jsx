import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { X, AlertCircle } from 'lucide-react';

const GoalModal = ({ isOpen, onClose, onSubmitSuccess }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setName('');
      setTargetAmount('');
      setDeadline('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a name for your goal.');
      return;
    }
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      setError('Please provide a positive target amount.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/goals', {
        name: name.trim(),
        target_amount: parseFloat(targetAmount),
        deadline: deadline || null
      });

      onSubmitSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error establishing savings goal.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content">
        <div className="modal-header">
          <h3>🎯 Create Savings Goal</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(248, 113, 113, 0.1)',
            color: 'var(--danger)',
            padding: '0.65rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="goal-name">What are you saving for?</label>
            <input
              id="goal-name"
              type="text"
              className="form-input"
              placeholder="e.g., New Laptop, Semester Trip"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="target-amount">Target Amount (₹)</label>
            <input
              id="target-amount"
              type="number"
              step="0.01"
              min="1"
              className="form-input"
              placeholder="e.g. 5000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="deadline">Target Date (Optional)</label>
            <input
              id="deadline"
              type="date"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
