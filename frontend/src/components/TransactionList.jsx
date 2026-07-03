import React, { useState } from 'react';
import { Edit2, Trash2, Search, ArrowUpDown } from 'lucide-react';

const TransactionList = ({ expenses, onEditClick, onDeleteClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Handling search and filter
  const filteredExpenses = expenses.filter(exp => {
    const desc = exp.description ? exp.description.toLowerCase() : '';
    const cat = exp.category_name ? exp.category_name.toLowerCase() : '';
    const query = searchTerm.toLowerCase();
    return desc.includes(query) || cat.includes(query);
  });

  // Sorting logic
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    } else if (sortBy === 'amount') {
      const amtA = parseFloat(a.amount);
      const amtB = parseFloat(b.amount);
      return sortOrder === 'desc' ? amtB - amtA : amtA - amtB;
    }
    return 0;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (name) => {
    const text = name ? name.toLowerCase() : '';
    if (text.includes('food')) return { bg: 'rgba(239, 68, 68, 0.12)', text: '#F87171' }; // Red
    if (text.includes('transport')) return { bg: 'rgba(16, 185, 129, 0.12)', text: '#34D399' }; // Emerald
    if (text.includes('entertainment')) return { bg: 'rgba(139, 92, 246, 0.12)', text: '#A78BFA' }; // Purple
    if (text.includes('book') || text.includes('academic')) return { bg: 'rgba(245, 158, 11, 0.12)', text: '#FBBF24' }; // Amber
    if (text.includes('utility') || text.includes('rent')) return { bg: 'rgba(6, 182, 212, 0.12)', text: '#22D3EE' }; // Cyan
    if (text.includes('groceries')) return { bg: 'rgba(236, 72, 153, 0.12)', text: '#F472B6' }; // Pink
    return { bg: 'rgba(107, 114, 128, 0.12)', text: '#9CA3AF' }; // Default Gray
  };

  return (
    <div className="glass-card transactions-card">
      <div className="table-header">
        <h4 style={{ fontSize: '1.1rem' }}>Transaction History</h4>
        
        {/* Search bar inside transaction table */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              paddingLeft: '2.2rem', 
              paddingTop: '0.45rem', 
              paddingBottom: '0.45rem', 
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-sm)'
            }}
          />
        </div>
      </div>

      <div className="table-container">
        {sortedExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
            <p>No transactions found matching your criteria.</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('date')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Date {sortBy === 'date' && <ArrowUpDown size={12} />}
                  </span>
                </th>
                <th>Category</th>
                <th>Description</th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('amount')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    Amount {sortBy === 'amount' && <ArrowUpDown size={12} />}
                  </span>
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedExpenses.map((exp) => {
                const colors = getCategoryColor(exp.category_name);
                return (
                  <tr key={exp.id}>
                    <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {formatDate(exp.date)}
                    </td>
                    <td>
                      <span 
                        className="category-tag" 
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {exp.category_name || 'Others'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={exp.description}>
                      {exp.description || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No description</span>}
                    </td>
                    <td className="td-amount spend">
                      ₹{parseFloat(exp.amount).toFixed(2)}
                    </td>
                    <td className="td-actions">
                      <button 
                        className="btn btn-icon-only" 
                        onClick={() => onEditClick(exp)}
                        title="Edit entry"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="btn btn-icon-only" 
                        onClick={() => onDeleteClick(exp.id)}
                        title="Delete entry"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
