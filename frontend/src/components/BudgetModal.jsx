import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { X, AlertCircle } from 'lucide-react';

const BudgetModal = ({ isOpen, onClose, onSubmitSuccess }) => {
  const [categoryId, setCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Months list helper
  const monthsList = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  useEffect(() => {
    if (isOpen) {
      setError('');
      fetchCategories();

      // Default to current month and year
      const today = new Date();
      setMonth(today.getMonth() + 1); // 1-12
      setYear(today.getFullYear());
      setLimitAmount('');
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
      if (res.data.length > 0 && !categoryId) {
        setCategoryId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching categories for budget setting:', err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!limitAmount || parseFloat(limitAmount) <= 0) {
      setError('Please provide a positive budget limit.');
      return;
    }
    if (!month) {
      setError('Please select a month.');
      return;
    }
    if (!year) {
      setError('Please provide a year.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/budgets', {
        category_id: categoryId,
        month: parseInt(month),
        year: parseInt(year),
        limit_amount: parseFloat(limitAmount)
      });

      onSubmitSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error establishing budget.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content">
        <div className="modal-header">
          <h3>🎯 Configure Budget Caps</h3>
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
            <label className="form-label" htmlFor="budget-category-select">Select Category</label>
            <select
              id="budget-category-select"
              className="form-input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.user_id ? '(Custom)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="limit-amount-input">Monthly Budget Limit (₹)</label>
            <input
              id="limit-amount-input"
              type="number"
              step="0.01"
              min="1"
              className="form-input"
              placeholder="e.g. 150.00"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="budget-month-select">Month</label>
              <select
                id="budget-month-select"
                className="form-input"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="budget-year-input">Year</label>
              <input
                id="budget-year-input"
                type="number"
                min="2000"
                max="2100"
                className="form-input"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Configuring...' : 'Set Limit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
