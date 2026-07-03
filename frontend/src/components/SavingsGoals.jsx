import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Target, TrendingUp, Plus, Trash2, ArrowRight } from 'lucide-react';

const SavingsGoals = ({ refreshTrigger, onNewGoal }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for adding funds inline
  const [fundGoalId, setFundGoalId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (error) {
      console.error('Failed to fetch savings goals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [refreshTrigger]);

  const handleAddFunds = async (e, goalId) => {
    e.preventDefault();
    if (!fundAmount || parseFloat(fundAmount) <= 0) return;

    try {
      await api.put(`/goals/${goalId}/add-funds`, { amount: parseFloat(fundAmount) });
      setFundGoalId(null);
      setFundAmount('');
      fetchGoals();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding funds');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      await api.delete(`/goals/${goalId}`);
      fetchGoals();
    } catch (error) {
      alert('Failed to delete goal');
    }
  };

  if (loading) {
    return <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>Loading goals...</div>;
  }

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Target size={20} style={{ color: 'var(--accent-neon)' }} /> Savings Goals
        </h3>
        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={onNewGoal}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No active savings goals. Start saving for something special!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {goals.map(goal => {
            const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const isCompleted = progress >= 100;

            return (
              <div key={goal.id} style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-sm)', 
                padding: '1rem' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>{goal.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: isCompleted ? 'var(--accent-neon)' : 'inherit', fontWeight: 'bold' }}>
                        ₹{goal.current_amount.toFixed(2)}
                      </span> 
                      {' '} / ₹{goal.target_amount.toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!isCompleted && fundGoalId !== goal.id && (
                      <button 
                        className="btn-text" 
                        onClick={() => setFundGoalId(goal.id)}
                        style={{ color: 'var(--accent-neon)', fontSize: '0.85rem' }}
                      >
                        <TrendingUp size={14} /> Add
                      </button>
                    )}
                    <button 
                      className="btn-text" 
                      onClick={() => handleDeleteGoal(goal.id)}
                      style={{ color: 'var(--danger)' }}
                      title="Delete Goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div style={{ 
                  height: '8px', 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem'
                }}>
                  {/* Progress Fill */}
                  <div style={{ 
                    height: '100%', 
                    width: `${progress}%`, 
                    background: isCompleted ? 'var(--accent-neon)' : 'var(--accent-purple)',
                    transition: 'width 0.4s ease-out'
                  }}></div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{progress.toFixed(1)}% Completed</span>
                  {goal.deadline && <span>Target: {new Date(goal.deadline).toLocaleDateString()}</span>}
                </div>

                {/* Inline Add Funds Form */}
                {fundGoalId === goal.id && (
                  <form onSubmit={(e) => handleAddFunds(e, goal.id)} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="Amount to add (₹)" 
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      min="1"
                      step="0.01"
                      style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                      autoFocus
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      Save
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setFundGoalId(null)}>
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;
