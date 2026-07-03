import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Sparkles, TrendingDown, RefreshCw, HelpCircle, Utensils, Percent, BookOpen, Car, Zap, PiggyBank } from 'lucide-react';

const FinancialAdvisor = ({ refreshTrigger }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchAdvisorTips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/advisor/tips');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching advisor recommendations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisorTips();
  }, [refreshTrigger]);

  const getTipIcon = (title) => {
    const text = title.toLowerCase();
    if (text.includes('cook') || text.includes('food') || text.includes('meal')) return <Utensils size={20} style={{ color: '#F87171' }} />;
    if (text.includes('discount') || text.includes('lever') || text.includes('student')) return <Percent size={20} style={{ color: '#60A5FA' }} />;
    if (text.includes('book') || text.includes('text') || text.includes('rent')) return <BookOpen size={20} style={{ color: '#FBBF24' }} />;
    if (text.includes('carpool') || text.includes('transit') || text.includes('transport')) return <Car size={20} style={{ color: '#34D399' }} />;
    if (text.includes('budget') || text.includes('overrun') || text.includes('limit')) return <TrendingDown size={20} style={{ color: '#F87171' }} />;
    if (text.includes('savings') || text.includes('bank') || text.includes('elite')) return <PiggyBank size={20} style={{ color: '#F472B6' }} />;
    return <Sparkles size={20} style={{ color: '#A78BFA' }} />;
  };

  if (loading) {
    return (
      <div className="glass-card ai-advisor-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--accent-purple)', animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI Financial Advisor is calculating recommendations...</p>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card ai-advisor-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <HelpCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Could not load advisor insights. Please check connection.</p>
      </div>
    );
  }

  const { insights, tips } = data;

  return (
    <div className="glass-card ai-advisor-card">
      <div className="ai-advisor-header">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.15)',
          color: 'var(--accent-purple)'
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            AI Financial Advisor
            <span className="ai-badge">VARDHAMAN AI</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rule-based customized savings tips & behaviors</p>
        </div>
      </div>

      {insights && (
        <div className="ai-insights-summary">
          <div className="ai-insight-item">
            7-Day Total: <strong>₹{parseFloat(insights.totalSpentLast7Days).toFixed(2)}</strong>
          </div>
          <div className="ai-insight-item">
            Weekly Peak: <strong>{insights.highestCategory7Days !== 'None' ? `${insights.highestCategory7Days} (₹${parseFloat(insights.highestCategoryAmount).toFixed(2)})` : 'No expenses'}</strong>
          </div>
          <div className="ai-insight-item">
            Active Budgets: <strong>{insights.activeBudgetsCount}</strong>
          </div>
        </div>
      )}

      <div className="ai-tips-grid">
        {tips.map((tip, idx) => (
          <div key={idx} className="ai-tip-item">
            <div className="ai-tip-icon">
              {getTipIcon(tip.title)}
            </div>
            <div className="ai-tip-content">
              <h5>{tip.title}</h5>
              <p>{tip.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialAdvisor;
