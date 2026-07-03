import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { X, Plus, AlertCircle } from 'lucide-react';

const ExpenseFormModal = ({ isOpen, onClose, onSubmitSuccess, expenseToEdit, expenses = [], budgets = [] }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');

  // Custom Category creation inline
  const [showCustomCat, setShowCustomCat] = useState(false);
  const [customCatName, setCustomCatName] = useState('');
  const [categories, setCategories] = useState([]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize fields on open/edit
  useEffect(() => {
    if (isOpen) {
      setError('');
      fetchCategories();

      if (expenseToEdit) {
        setAmount(expenseToEdit.amount.toString());
        setDate(expenseToEdit.date);
        setCategoryId(expenseToEdit.category_id.toString());
        setDescription(expenseToEdit.description || '');
      } else {
        // Set standard defaults
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]); // Current date in local zone
        setCategoryId('');
        setDescription('');
      }
    }
  }, [isOpen, expenseToEdit]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
      // Auto select first category if adding new and none selected
      if (res.data.length > 0 && !expenseToEdit && !categoryId) {
        setCategoryId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching categories:', err.message);
    }
  };

  const handleAddCustomCategory = async (e) => {
    e.preventDefault();
    if (!customCatName.trim()) return;

    try {
      const res = await api.post('/categories', { name: customCatName.trim() });
      const newCat = res.data.category;
      
      // Update local dropdown list
      setCategories(prev => [...prev, newCat]);
      setCategoryId(newCat.id.toString());
      setCustomCatName('');
      setShowCustomCat(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add custom category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please provide a positive non-zero amount.');
      return;
    }
    if (!date) {
      setError('Please select a valid transaction date.');
      return;
    }
    if (!categoryId) {
      setError('Please choose a category.');
      return;
    }

    // Budget Validation
    const expDate = new Date(date);
    const month = expDate.getMonth() + 1;
    const year = expDate.getFullYear();
    const catId = categoryId;

    const activeBudget = budgets.find(b => b.category_id === catId && b.month === month && b.year === year);
    if (activeBudget) {
      const currentSpent = expenses
        .filter(exp => {
          const d = new Date(exp.date);
          return exp.category_id === catId && d.getMonth() + 1 === month && d.getFullYear() === year && exp.id !== expenseToEdit?.id;
        })
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        
      if (currentSpent + parseFloat(amount) > parseFloat(activeBudget.limit_amount)) {
        setError(`Warning: This expense exceeds your monthly budget limit of ₹${activeBudget.limit_amount} for this category!`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        date,
        category_id: categoryId,
        description: description.trim() || null
      };

      if (expenseToEdit) {
        await api.put(`/expenses/${expenseToEdit.id}`, payload);
      } else {
        await api.post('/expenses', payload);
      }

      onSubmitSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Error saving expense transaction.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-card modal-content">
        <div className="modal-header">
          <h3>{expenseToEdit ? '✏️ Edit Expense' : '➕ Add Expense'}</h3>
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
            <label className="form-label" htmlFor="amount-input">Amount (₹)</label>
            <input
              id="amount-input"
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="date-input">Transaction Date</label>
            <input
              id="date-input"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" htmlFor="category-select" style={{ margin: 0 }}>Category</label>
              <button 
                type="button" 
                className="btn-text" 
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                onClick={() => setShowCustomCat(!showCustomCat)}
              >
                <Plus size={12} /> {showCustomCat ? 'Cancel' : 'Create Custom'}
              </button>
            </div>

            {!showCustomCat ? (
              <select
                id="category-select"
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
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Subscriptions"
                  value={customCatName}
                  onChange={(e) => setCustomCatName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleAddCustomCategory}
                  style={{ padding: '0.6rem 1rem' }}
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1.8rem' }}>
            <label className="form-label" htmlFor="description-input">Description (Optional)</label>
            <input
              id="description-input"
              type="text"
              className="form-input"
              placeholder="e.g. Vardhaman canteen lunch"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : expenseToEdit ? 'Save Changes' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
